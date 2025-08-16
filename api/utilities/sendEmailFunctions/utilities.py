import random

from userVerification.models import VerificationCode
from services.EmailService import sendEmail
from utilities.authHtmlPage import authHtml
from utilities.orderConfirmHtml import orderConfirmHtml
from utilities.orderPaymentSuccessHtml import orderPaymentSuccessHtml
from utilities.orderStatusChangedHtml import orderStatusChangedHtml


def SendSignupCode(email: str, role: "customer" or "restairantManager"):
    code = random.randint(10000, 99999)
    html = authHtml("کد تایید ثبت نام در elite bite", code)
    status = sendEmail(email, "کد تایید ثبت نام در elite bite", html)
    if status:
        code = VerificationCode.objects.create(email=email, code=code, forLogin=False, role=role)
        code.save()
        return True
    else:
        return False


def SendLoginCode(email: str, role: "customer" or "restairantManager"):
    code = random.randint(10000, 99999)
    html = authHtml("کد یکبار مصرف ورود به elite bite", code)
    status = sendEmail(email, "کد یکبار مصرف ورود به elite bite", html)
    if status:
        code = VerificationCode.objects.create(email=email, code=code, forLogin=True, role=role)
        code.save()
        return True
    else:
        return False


def SendPaymentCode(email: str, code: str):
    html = orderConfirmHtml(code)
    status = sendEmail(email, "کد پرداخت سفارش در elite bite", html)
    if status:
        return True
    else:
        return False


def SendPaymentSuccess(email: str, order_id: str):
    html = orderPaymentSuccessHtml(order_id)
    status = sendEmail(email, "پرداخت موفقیت آمیز در elite bite", html)
    if status:
        return True
    else:
        return False

def SendStatusOrder(email: str, order_id: str, status: str, waitMinutes: str):
    html = orderStatusChangedHtml(order_id, status, waitMinutes)
    status = sendEmail(email, "تغییر وضعیت سفارش در elite bite", html)
    if status:
        return True
    else:
        return False