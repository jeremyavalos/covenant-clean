import os
from urllib.parse import urlencode

import resend


SUPPORTED_LANGUAGES = {"en", "es"}
DEFAULT_EMAIL_LANGUAGE = "en"


def _normalize_language(language: str | None) -> str:
    if language in SUPPORTED_LANGUAGES:
        return language

    return DEFAULT_EMAIL_LANGUAGE


def _build_backend_url(path: str, token: str, language: str | None = None) -> str:
    backend_url = os.getenv(
        "COVENANT_BACKEND_URL",
        "https://covenant-clean-production.up.railway.app",
    )
    base_url = backend_url.rstrip("/")
    query = urlencode(
        {
            "token": token,
            "language": _normalize_language(language),
        }
    )
    return f"{base_url}/auth/{path}?{query}"


def _email_shell(
    title: str,
    body: str,
    button_text: str,
    button_url: str,
    link_help: str,
) -> str:
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
                    <p style="margin:0;color:#7f766d;font-size:12px;line-height:1.6;">{link_help}<br>{button_url}</p>
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
    resend_reply_to_email = os.getenv("RESEND_REPLY_TO_EMAIL")

    if not resend_api_key:
        raise RuntimeError("RESEND_API_KEY is not configured.")

    params = {
        "from": resend_from_email,
        "to": [to_email],
        "subject": subject,
        "html": html,
    }

    if resend_reply_to_email:
        params["reply_to"] = resend_reply_to_email

    resend.api_key = resend_api_key
    response = resend.Emails.send(params)
    print(
        f"[Covenant email] Resend accepted message to {to_email} with subject '{subject}': {response}"
    )


def send_verification_email(to_email: str, token: str, language: str | None = None) -> None:
    language = _normalize_language(language)
    verify_url = _build_backend_url("verify-email", token, language)
    copy = {
        "en": {
            "subject": "Verify your Covenant account",
            "title": "Verify your Covenant account.",
            "body": "Tap the button below to verify your account. If you did not request this, you can ignore this email.",
            "button": "VERIFY",
            "link_help": "If the button does not work, copy this link into your browser:",
        },
        "es": {
            "subject": "Verifica tu cuenta de Covenant",
            "title": "Verifica tu cuenta de Covenant.",
            "body": "Toca el botón de abajo para verificar tu cuenta. Si no solicitaste esto, puedes ignorar este correo.",
            "button": "VERIFICAR",
            "link_help": "Si el botón no funciona, copia este enlace en tu navegador:",
        },
    }[language]

    html = _email_shell(
        title=copy["title"],
        body=copy["body"],
        button_text=copy["button"],
        button_url=verify_url,
        link_help=copy["link_help"],
    )

    send_email(
        to_email=to_email,
        subject=copy["subject"],
        html=html,
    )


def send_password_reset_email(to_email: str, token: str, language: str | None = None) -> None:
    language = _normalize_language(language)
    reset_url = _build_backend_url("reset-password", token, language)
    copy = {
        "en": {
            "subject": "Reset your Covenant password",
            "title": "Reset your password.",
            "body": "Use this secure link to choose a new password. The link expires soon.",
            "button": "RESET PASSWORD",
            "link_help": "If the button does not work, copy this link into your browser:",
        },
        "es": {
            "subject": "Restablece tu contraseña de Covenant",
            "title": "Restablece tu contraseña.",
            "body": "Usa este enlace seguro para elegir una nueva contraseña. El enlace vence pronto.",
            "button": "RESTABLECER",
            "link_help": "Si el botón no funciona, copia este enlace en tu navegador:",
        },
    }[language]

    html = _email_shell(
        title=copy["title"],
        body=copy["body"],
        button_text=copy["button"],
        button_url=reset_url,
        link_help=copy["link_help"],
    )

    send_email(
        to_email=to_email,
        subject=copy["subject"],
        html=html,
    )
