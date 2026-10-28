import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  Popconfirm,
  message,
  Typography,
  Card,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { accountApi } from '../../api/accountApi';
import { departmentApi } from '../../api/departmentApi';
import { positionApi } from '../../api/positionApi';
import { Account, Department, Position, Role } from '../../types';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

export const AccountListPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filters & Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [positionId, setPositionId] = useState<number | undefined>(undefined);
  const [role, setRole] = useState<Role | undefined>(undefined);

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const [modalLoading, setModalLoading] = useState(false);

  const { isAdmin } = useAuth();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountApi.getAccounts({
        page,
        size: pageSize,
        keyword: keyword || undefined,
        departmentId,
        positionId,
        role,
      });
      if (res.data) {
        setAccounts(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, departmentId, positionId, role]);

  const fetchDepartmentsAndPositions = async () => {
    try {
      const [deptRes, posRes] = await Promise.all([
        departmentApi.getDepartments(),
        positionApi.getPositions(),
      ]);
      if (deptRes.data) setDepartments(deptRes.data);
      if (posRes.data) setPositions(posRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndPositions();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      form.setFieldsValue({
        username: account.username,
        fullname: account.fullname,
        email: account.email,
        departmentId: account.departmentId,
        positionId: account.positionId,
        role: account.role,
        password: '',
      });
    } else {
      setEditingAccount(null);
      form.resetFields();
      form.setFieldsValue({ role: 'USER' });
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);

      if (editingAccount) {
        await accountApi.updateAccount(editingAccount.id, values);
        message.success('Account updated successfully');
      } else {
        await accountApi.createAccount(values);
        message.success('Account created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchAccounts();
    } catch (err: any) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await accountApi.deleteAccount(id);
      message.success('Account deleted successfully');
      fetchAccounts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (name: string) => name || <Typography.Text type="secondary">N/A</Typography.Text>,
    },
    {
      title: 'Position',
      dataIndex: 'positionName',
      key: 'positionName',
      render: (name: string) => name || <Typography.Text type="secondary">N/A</Typography.Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => (
        <Tag color={role === 'ADMIN' ? 'geekblue' : 'green'}>{role}</Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'),
    },
    ...(isAdmin
      ? [
          {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Account) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(record)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete Account"
                  description="Are you sure you want to delete this account?"
                  onConfirm={() => handleDelete(record.id)}
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
          Account Management
        </Title>
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            Add Account
          </Button>
        )}
      </div>

      <Card style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search by username, fullname, email"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Filter by Department"
              style={{ width: '100%' }}
              value={departmentId}
              onChange={(val) => {
                setDepartmentId(val);
                setPage(0);
              }}
              allowClear
            >
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Filter by Position"
              style={{ width: '100%' }}
              value={positionId}
              onChange={(val) => {
                setPositionId(val);
                setPage(0);
              }}
              allowClear
            >
              {positions.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Filter by Role"
              style={{ width: '100%' }}
              value={role}
              onChange={(val) => {
                setRole(val);
                setPage(0);
              }}
              allowClear
            >
              <Option value="ADMIN">ADMIN</Option>
              <Option value="USER">USER</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAccounts()} block>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={accounts}
        loading={loading}
        pagination={{
          current: page + 1,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          onChange: (newPage, newPageSize) => {
            setPage(newPage - 1);
            setPageSize(newPageSize);
          },
        }}
      />

      <Modal
        title={editingAccount ? 'Edit Account' : 'Add New Account'}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="accountForm">
          {!editingAccount && (
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter username' },
                { min: 3, message: 'Username must be at least 3 characters' },
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
          )}

          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email address' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingAccount ? 'New Password (leave blank to keep current)' : 'Password'}
            rules={
              editingAccount
                ? [{ min: 6, message: 'Password must be at least 6 characters' }]
                : [
                    { required: true, message: 'Please enter password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]
            }
          >
            <Input.Password placeholder={editingAccount ? 'Leave blank to keep unchanged' : 'Password'} />
          </Form.Item>

          <Form.Item name="departmentId" label="Department">
            <Select placeholder="Select department" allowClear>
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="positionId" label="Position">
            <Select placeholder="Select position" allowClear>
              {positions.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="USER">USER</Option>
              <Option value="ADMIN">ADMIN</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
