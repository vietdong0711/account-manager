import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Alert, Progress } from 'antd';
import {
  UserOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { accountApi } from '../../api/accountApi';
import { DashboardStats } from '../../types';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await accountApi.getStats();
        if (res.data) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" tip="Loading statistics..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  const total = stats?.totalAccounts || 0;
  const adminPercent = total > 0 ? Math.round(((stats?.adminCount || 0) / total) * 100) : 0;
  const userPercent = total > 0 ? 100 - adminPercent : 0;

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        System Overview
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ background: '#e6f4ff', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Total Accounts</Text>}
              value={stats?.totalAccounts || 0}
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Departments</Text>}
              value={stats?.totalDepartments || 0}
              prefix={<ApartmentOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} style={{ background: '#fff7e6', borderRadius: 8 }}>
            <Statistic
              title={<Text strong>Positions</Text>}
              value={stats?.totalPositions || 0}
              prefix={<IdcardOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Card title="Account Role Breakdown" bordered={false}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card type="inner" title={<><SafetyCertificateOutlined style={{ color: '#1677ff' }} /> Administrator Accounts</>}>
                <Statistic value={stats?.adminCount || 0} suffix={`/ ${total}`} />
                <Progress percent={adminPercent} strokeColor="#1677ff" style={{ marginTop: 12 }} />
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card type="inner" title={<><TeamOutlined style={{ color: '#52c41a' }} /> Standard User Accounts</>}>
                <Statistic value={stats?.userCount || 0} suffix={`/ ${total}`} />
                <Progress percent={userPercent} strokeColor="#52c41a" style={{ marginTop: 12 }} />
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};
