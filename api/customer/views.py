from datetime import timedelta
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Customer
from userVerification.models import VerificationCode
from .utilities import SendSignupCode, SendLoginCode


class SignupCodeView(APIView):
    def post(self, request):
        data = request.data
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        email = data.get('email')

        if not all([firstName, lastName, email]):
            return Response({'message': 'اطلاعات ورودی ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        existing_user = Customer.objects.filter(email=email, isVerified=True)
        not_verified_user = Customer.objects.filter(email=email, isVerified=False)

        time_threshold = timezone.now() - timedelta(seconds=120)
        recent_code = VerificationCode.objects.filter(
            email=email, used=False, sendDate__gte=time_threshold, role="customer"
        )

        if existing_user.exists():
            return Response({'message': 'این ایمیل یک حساب کاربری فعال دارد.', 'status': 'exist'},
                            status=status.HTTP_409_CONFLICT)

        if not_verified_user.exists():
            if recent_code.exists():
                return Response({'message': 'کد تائید ثبت نام اخیراً ارسال شده و هنوز معتبر است.', 'status': 'success'},
                                status=status.HTTP_200_OK)
            sent = SendSignupCode(email, "customer")
            if not sent:
                return Response({'message': 'مشکلی در ارسال کد بوجود آمده است.', 'status': 'error'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            Customer.objects.filter(email=email).update(firstName=firstName, lastName=lastName)
            return Response({'message': 'کد تایید دوباره ارسال شد. در صورت تایید، حساب شما فعال خواهد شد.', 'status': 'success'},
                            status=status.HTTP_200_OK)

        customer = Customer.objects.create(
            firstName=firstName,
            lastName=lastName,
            email=email,
            isVerified=False,
        )
        sent = SendSignupCode(email, "customer")
        if not sent:
            customer.delete()
            return Response({'message': 'مشکلی در ارسال کد بوجود آمده است.', 'status': 'error'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'کد تائید ثبت نام برای ایمیل شما ارسال شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class SignupVerifyView(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        code = data.get('code')

        if not all([email, code]):
            return Response({'message': 'اطلاعات ورودی ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        time_threshold = timezone.now() - timedelta(seconds=120)
        code_obj = VerificationCode.objects.filter(
            email=email, code=code, used=False, sendDate__gte=time_threshold, role="customer"
        ).first()

        if not code_obj:
            return Response({'message': 'کد تایید نامعتبر یا منقضی شده است.', 'status': 'error'},
                            status=status.HTTP_400_BAD_REQUEST)

        code_obj.used = True
        code_obj.save()

        try:
            customer = Customer.objects.get(email=email)
            customer.isVerified = True
            customer.save()
        except Customer.DoesNotExist:
            return Response({'message': 'کاربر یافت نشد.', 'status': 'error'},
                            status=status.HTTP_404_NOT_FOUND)

        return Response({'message': 'ثبت‌نام شما با موفقیت تایید شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class LoginCodeView(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')

        if not email:
            return Response({'message': 'اطلاعات ورودی ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response({'message': 'کاربری با این ایمیل یافت نشد.', 'status': 'notFound'},
                            status=status.HTTP_404_NOT_FOUND)

        if not customer.isVerified:
            return Response({'message': 'حساب کاربری شما غیرفعال است.', 'status': 'notVerified'},
                            status=status.HTTP_403_FORBIDDEN)

        time_threshold = timezone.now() - timedelta(seconds=120)
        recent_code = VerificationCode.objects.filter(
            email=email, used=False, sendDate__gte=time_threshold, role="customer"
        )

        if recent_code.exists():
            return Response({'message': 'کد ورود اخیراً ارسال شده و معتبر است.', 'status': 'success'},
                            status=status.HTTP_200_OK)

        sent = SendLoginCode(email, "customer")
        if not sent:
            return Response({'message': 'مشکلی در ارسال کد بوجود آمده است.', 'status': 'error'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'کد یکبار مصرف ورود ارسال شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class LoginVerifyView(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        code = data.get('code')

        if not all([email, code]):
            return Response({'message': 'اطلاعات ورودی ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        time_threshold = timezone.now() - timedelta(seconds=120)
        code_obj = VerificationCode.objects.filter(
            email=email, code=code, used=False, sendDate__gte=time_threshold, role="customer"
        ).first()

        if not code_obj:
            return Response({'message': 'کد نامعتبر یا منقضی شده است.', 'status': 'error'},
                            status=status.HTTP_400_BAD_REQUEST)
        code_obj.used = True
        code_obj.save()

        customer = Customer.objects.filter(email=email).first()
        if not customer:
            return Response({'message': 'کاربری با این ایمیل پیدا نشد.', 'status': 'notFound'},
                            status=status.HTTP_404_NOT_FOUND)
        request.session['customer_login'] = {
            'id': customer.id,
            'email': customer.email
        }
        return Response({'message': 'ورود موفقیت‌آمیز.', 'status': 'success'},
                        status=status.HTTP_200_OK)
