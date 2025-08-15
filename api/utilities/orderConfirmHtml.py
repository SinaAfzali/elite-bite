def orderConfirmHtml(code: int):
    return f"""
    <html lang="fa">
      <body style="margin: 0; padding: 0; background: #f0f2f5; font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px 0;">
          <tr>
            <td>
              <table align="center" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(to bottom right, #ffffff, #f9fbfd); border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 50px;">
                    <h1 style="margin: 0; font-size: 22px; color: #1e1e2f; font-weight: 700; text-align: center;">
                      تایید سفارش شما در <span style="color: #0077ff;">elite bite</span> 🛒
                    </h1>
                    <p style="font-size: 16px; color: #4b4b4b; line-height: 2; margin-top: 40px;">
                      مشتری گرامی، برای تایید سفارش خود لطفاً کد زیر را در اپلیکیشن وارد کنید.
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                      <span style="
                        display: inline-block;
                        padding: 16px 36px;
                        font-size: 30px;
                        font-weight: bold;
                        letter-spacing: 6px;
                        color: #ffffff;
                        background: linear-gradient(135deg, #28a745, #85d26b);
                        border-radius: 12px;
                        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                      ">
                        {code}
                      </span>
                    </div>
                    <p style="font-size: 15px; color: #666; line-height: 1.8;">
                      این کد فقط برای تایید این سفارش معتبر است. 
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
                      تمامی حقوق محفوظ است. © 2025 ELITE BITE
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
