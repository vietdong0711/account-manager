import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Typography,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { departmentApi } from '../../api/departmentApi';
import { Department } from '../../types';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

export const DepartmentListPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const { isAdmin } = useAuth();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getDepartments();
      if (res.data) {
        setDepartments(res.data);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      form.setFieldsValue({ name: dept.name });
    } else {
      setEditingDept(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, values);
        message.success('Department updated successfully');
      } else {
        await departmentApi.createDepartment(values);
        message.success('Department created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchDepartments();
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (dept: Department) => {
    if (dept.accountCount > 0) {
      message.error(`Cannot delete department because it is assigned to ${dept.accountCount} account(s)`);
      return;
    }
    try {
      await departmentApi.deleteDepartment(dept.id);
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Assigned Accounts',
      dataIndex: 'accountCount',
      key: 'accountCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count} account(s)</Tag>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Department) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Department"
                  description={
                    record.accountCount > 0
                      ? 'Warning: This department has accounts assigned to it and cannot be deleted!'
                      : 'Are you sure you want to delete this department?'
                  }
                  onConfirm={() => handleDelete(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          Department Management
        </Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Add Department
          </Button>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={departments}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingDept ? 'Edit Department' : 'Add Department'}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="deptForm">
          <Form.Item
            name="name"
            label="Department Name"
            rules={[
              { required: true, message: 'Please enter department name' },
              { max: 150, message: 'Name cannot exceed 150 characters' },
            ]}
          >
            <Input placeholder="e.g. Finance, Human Resources" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
