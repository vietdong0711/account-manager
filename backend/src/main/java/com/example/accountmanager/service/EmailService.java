package com.example.accountmanager.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@accountmanager.com}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String baseUrl = frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "http://localhost:3000";
        String resetLink = baseUrl + "/reset-password?token=" + resetToken;

        log.info("Sending password reset email to: {} with link: {}", toEmail, resetLink);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đặt lại mật khẩu - Account Manager");

            String htmlContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">"
                    + "<h2 style=\"color: #1890ff; text-align: center;\">Đặt Lại Mật Khẩu</h2>"
                    + "<p>Xin chào,</p>"
                    + "<p>Bạn đã gửi yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Account Manager</strong>.</p>"
                    + "<p>Vui lòng nhấn vào nút bên dưới để tiến hành đổi mật khẩu mới:</p>"
                    + "<div style=\"text-align: center; margin: 30px 0;\">"
                    + "<a href=\"" + resetLink + "\" style=\"background-color: #1890ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;\">Đổi Mật Khẩu Mới</a>"
                    + "</div>"
                    + "<p>Nếu nút bấm trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>"
                    + "<p style=\"word-break: break-all;\"><a href=\"" + resetLink + "\">" + resetLink + "</a></p>"
                    + "<p style=\"color: #ff4d4f; font-size: 13px;\"><em>* Liên kết này sẽ hết hạn sau 30 phút.</em></p>"
                    + "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và mật khẩu của bạn vẫn được giữ nguyên.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #eee; margin: 20px 0;\" />"
                    + "<p style=\"font-size: 12px; color: #888; text-align: center;\">Account Management System</p>"
                    + "</div>";

            String plainText = "Xin chào,\n\n"
                    + "Bạn đã gửi yêu cầu đặt lại mật khẩu cho tài khoản tại Account Manager.\n"
                    + "Vui lòng truy cập đường link sau để đổi mật khẩu mới:\n\n"
                    + resetLink + "\n\n"
                    + "Liên kết này sẽ hết hạn sau 30 phút.\n"
                    + "Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email.\n\n"
                    + "Trân trọng,\nAccount Management Team";

            helper.setText(plainText, htmlContent);

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.warn("Could not send HTML email to {} via SMTP (reason: {}). Attempting plain text fallback...",
                    toEmail, e.getMessage());
            sendFallbackSimpleMessage(toEmail, resetLink);
        }
    }

    private void sendFallbackSimpleMessage(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Yêu cầu đặt lại mật khẩu - Account Manager");
            message.setText("Xin chào,\n\n"
                    + "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Account Manager.\n"
                    + "Vui lòng truy cập đường link sau để đổi mật khẩu mới:\n\n"
                    + resetLink + "\n\n"
                    + "Liên kết này sẽ hết hạn sau 30 phút.\n"
                    + "Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email.\n\n"
                    + "Trân trọng,\nAccount Management Team");

            mailSender.send(message);
            log.info("Fallback password reset email sent successfully to {}", toEmail);
        } catch (Exception ex) {
            log.warn("Could not send fallback email to {} (reason: {}). Reset link is: {}",
                    toEmail, ex.getMessage(), resetLink);
        }
    }
}
