def orderStatusChangedHtml(orderId: str, status: str, waitMinutes: str):
    return f"""
    <html lang="fa">
      <body style="margin: 0; padding: 0; background: #f0f2f5; font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl;">
        <table align="center" cellpadding="0" cellspacing="0" width="100%" style="padding: 40px 0;">
          <tr>
            <td>
              <table align="center" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 50px;">
                    <h1 style="margin: 0; font-size: 22px; color: #0077ff; font-weight: 700; text-align: center;">
                      📢 تغییر وضعیت سفارش
                    </h1>
                    <p style="font-size: 16px; color: #4b4b4b; line-height: 2; margin-top: 30px;">
                      مشتری گرامی، وضعیت سفارش شما با شناسه <strong>{orderId}</strong> به <strong>{status}</strong> تغییر کرد. 
                      <p>زمان تقریبی باقی مانده تا تحویل سفارش شما : {waitMinutes} دقیقه </p>
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                      <span style="
                        display: inline-block;
                        padding: 14px 30px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ffffff;
                        background: linear-gradient(135deg, #0077ff, #00c6ff);
                        border-radius: 8px;
                        box-shadow: 0 4px 15px rgba(0, 119, 255, 0.3);
                      ">
                        وضعیت جدید: {status}
                      </span>
                    </div>
                    <p style="font-size: 14px; color: #666; line-height: 1.8; text-align: center;">
                      از همراهی شما سپاسگزاریم ❤️
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
