import random

from userVerification.models import VerificationCode
from services.EmailService import sendEmail
from utilities.authHtmlPage import authHtml


def SendSignupCode(email: str):
    code = random.randint(10000, 99999)
    html = authHtml("کد تایید ثبت نام شما در elite bite", code)
    status = sendEmail(email, "کد تایید ثبت نام در elite bite", html)
    if status:
        code = VerificationCode.objects.create(email=email, code=code, forLogin=False)
        code.save()
        return True
    else:
        return False


def SendLoginCode(email: str):
    code = random.randint(10000, 99999)
    html = authHtml("کد یکبار مصرف ورود شما به elite bite", code)
    status = sendEmail(email, "کد یکبار مصرف ورود به elite bite", html)
    if status:
        code = VerificationCode.objects.create(email=email, code=code, forLogin=False)
        code.save()
        return True
    else:
        return False