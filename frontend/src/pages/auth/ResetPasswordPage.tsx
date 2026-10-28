import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { LockOutlined, ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';

const { Title, Text } = Typography;

export const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const onFinish = async (values: any) => {
    if (!token) {
      setErrorMsg('Password reset token is missing. Please request a new link.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await authApi.resetPassword({
        token: token.trim(),
        newPassword: values.newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 420, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            Reset Password
          </Title>
          <Text type="secondary">Enter your new password</Text>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Password Reset Successful"
              description="Your password has been updated. You can now sign in with your new credentials."
              type="success"
              showIcon
              style={{ marginBottom: 20 }}
            />
            <Button type="primary" onClick={() => navigate('/login')} block size="large">
              Go to Login
            </Button>
          </div>
        ) : !token ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Invalid or Missing Token"
              description="No reset token was found in the URL. Please request a new password reset link."
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              style={{ marginBottom: 20 }}
            />
            <Button type="primary" onClick={() => navigate('/forgot-password')} block size="large">
              Request Reset Link
            </Button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login">
                <ArrowLeftOutlined /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                closable
                style={{ marginBottom: 16 }}
                onClose={() => setErrorMsg(null)}
              />
            )}

            <Form form={form} name="reset-password" onFinish={onFinish} layout="vertical" size="large">
              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="New Password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  Reset Password
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login">
                  <ArrowLeftOutlined /> Back to Login
                </Link>
              </div>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};
