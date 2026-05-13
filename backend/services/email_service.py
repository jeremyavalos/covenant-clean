import os

import resend


def _build_app_url(path: str, token: str) -> str:
    covenant_app_url = os.getenv("COVENANT_APP_URL", "covenant://auth")
    base_url = covenant_app_url.rstrip("/")
    return f"{base_url}/{path}?token={token}"


def _build_verification_url(token: str) -> str:
    backend_url = os.getenv(
        "COVENANT_BACKEND_URL",
        "https://covenant-clean-production.up.railway.app",
    )
    base_url = backend_url.rstrip("/")
    return f"{base_url}/auth/verify-email?token={token}"


def _email_shell(title: str, body: str, button_text: str, button_url: str) -> str:
    return f"""
    <!doctype html>
    <html>
      <body style="margin:0;background:#050505;color:#f5f1ea;font-family:Inter,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;border:1px solid rgba(216,140,58,0.28);background:#0b0b0b;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:34px 32px 10px;text-align:center;">
                    <div style="letter-spacing:6px;color:#d88c3a;font-size:12px;font-weight:700;">COVENANT</div>
                    <h1 style="margin:22px 0 10px;color:#fff8ef;font-size:28px;line-height:1.2;font-weight:500;">{title}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 32px 26px;text-align:center;">
                    <p style="margin:0;color:#c9c0b4;font-size:16px;line-height:1.7;">{body}</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 32px 34px;">
                    <a href="{button_url}" style="display:inline-block;background:#d88c3a;color:#080808;text-decoration:none;font-weight:800;letter-spacing:2px;font-size:13px;padding:15px 24px;border-radius:999px;">{button_text}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 32px;background:#080808;text-align:center;border-top:1px solid rgba(216,140,58,0.18);">
                    <p style="margin:0;color:#7f766d;font-size:12px;line-height:1.6;">If the button does not work, copy this link into your browser:<br>{button_url}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def send_email(to_email: str, subject: str, html: str) -> None:
    resend_api_key = os.getenv("RESEND_API_KEY")
    resend_from_email = os.getenv(
        "RESEND_FROM_EMAIL",
        "Covenant <noreply@joincovenantapp.com>",
    )

    if not resend_api_key:
        raise RuntimeError("RESEND_API_KEY is not configured.")

    resend.api_key = resend_api_key
    resend.Emails.send(
        {
            "from": resend_from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
    )


def send_verification_email(to_email: str, token: str) -> None:
    verify_url = _build_verification_url(token)
    html = _email_shell(
        title="Verify your covenant.",
        body="Confirm your email to protect your account and keep your discipline tied to you alone.",
        button_text="VERIFY",
        button_url=verify_url,
    )

    send_email(
        to_email=to_email,
        subject="Verify your Covenant email",
        html=html,
    )


def send_password_reset_email(to_email: str, token: str) -> None:
    reset_url = _build_app_url("reset-password", token)
    html = _email_shell(
        title="Reset your password.",
        body="Use this secure link to choose a new password. The link expires soon.",
        button_text="RESET PASSWORD",
        button_url=reset_url,
    )

    send_email(
        to_email=to_email,
        subject="Reset your Covenant password",
        html=html,
    )
