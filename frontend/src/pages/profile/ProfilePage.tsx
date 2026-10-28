import React from 'react';
import { Card, Descriptions, Tag, Typography, Button, Space } from 'antd';
import { UserOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0 }}>
          My Profile
        </Title>
        <Button
          type="primary"
          icon={<KeyOutlined />}
          onClick={() => navigate('/change-password')}
        >
          Change Password
        </Button>
      </div>

      <Card>
        <Descriptions bordered column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }} size="middle">
          <Descriptions.Item label="Username">
            <Typography.Text strong>{user?.username}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Full Name">{user?.fullname}</Descriptions.Item>
          <Descriptions.Item label="Email">{user?.email}</Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={user?.role === 'ADMIN' ? 'geekblue' : 'green'}>
              {user?.role}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {user?.departmentName || <Typography.Text type="secondary">Not Assigned</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Position">
            {user?.positionName || <Typography.Text type="secondary">Not Assigned</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Account Created">
            {user?.createDate ? dayjs(user.createDate).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};
