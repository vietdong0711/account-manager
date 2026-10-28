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
import { positionApi } from '../../api/positionApi';
import { Position } from '../../types';
import { useAuth } from '../../context/AuthContext';

const { Title } = Typography;

export const PositionListPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const { isAdmin } = useAuth();

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await positionApi.getPositions();
      if (res.data) {
        setPositions(res.data);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleOpenModal = (pos?: Position) => {
    if (pos) {
      setEditingPos(pos);
      form.setFieldsValue({ name: pos.name });
    } else {
      setEditingPos(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingPos) {
        await positionApi.updatePosition(editingPos.id, values);
        message.success('Position updated successfully');
      } else {
        await positionApi.createPosition(values);
        message.success('Position created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchPositions();
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (pos: Position) => {
    if (pos.accountCount > 0) {
      message.error(`Cannot delete position because it is assigned to ${pos.accountCount} account(s)`);
      return;
    }
    try {
      await positionApi.deletePosition(pos.id);
      message.success('Position deleted successfully');
      fetchPositions();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete position');
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
      title: 'Position Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Assigned Accounts',
      dataIndex: 'accountCount',
      key: 'accountCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'orange' : 'default'}>{count} account(s)</Tag>
      ),
    },
    ...(isAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Position) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Position"
                  description={
                    record.accountCount > 0
                      ? 'Warning: This position has accounts assigned to it and cannot be deleted!'
                      : 'Are you sure you want to delete this position?'
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
          Position Management
        </Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Add Position
          </Button>
        )}
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={positions}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingPos ? 'Edit Position' : 'Add Position'}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="posForm">
          <Form.Item
            name="name"
            label="Position Name"
            rules={[
              { required: true, message: 'Please enter position name' },
              { max: 150, message: 'Name cannot exceed 150 characters' },
            ]}
          >
            <Input placeholder="e.g. Lead Developer, Product Manager" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
