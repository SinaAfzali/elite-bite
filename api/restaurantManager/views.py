from datetime import timedelta
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from restaurant.models import Restaurant
from .models import RestaurantManager
from userVerification.models import VerificationCode
from utilities.sendEmailFunctions.utilities import SendSignupCode, SendLoginCode
from .services import getRestaurantManager


class SignupCodeView(APIView):
    def post(self, request):
        data = request.data
        firstName = data.get('firstName')
        lastName = data.get('lastName')
        email = data.get('email')

        if not all([firstName, lastName, email]):
            return Response({'message': 'اطلاعات ورودی ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        existing_user = RestaurantManager.objects.filter(email=email, isVerified=True)
        not_verified_user = RestaurantManager.objects.filter(email=email, isVerified=False)

        time_threshold = timezone.now() - timedelta(seconds=120)
        recent_code = VerificationCode.objects.filter(email=email, used=False, sendDate__gte=time_threshold, role="RestaurantManager")

        if existing_user.exists():
            return Response({'message': 'این ایمیل یک حساب کاربری فعال دارد.', 'status': 'exist'},
                            status=status.HTTP_409_CONFLICT)

        if not_verified_user.exists():
            if recent_code.exists():
                return Response({'message': 'کد قبلاً ارسال شده و معتبر است.', 'status': 'success'},
                                status=status.HTTP_200_OK)
            sent = SendSignupCode(email, "RestaurantManager")
            if not sent:
                return Response({'message': 'ارسال کد با خطا مواجه شد.', 'status': 'error'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            not_verified_user.update(firstName=firstName, lastName=lastName)
            return Response({'message': 'کد جدید ارسال شد. اطلاعات شما به‌روز شد.', 'status': 'success'},
                            status=status.HTTP_200_OK)

        manager = RestaurantManager.objects.create(
            firstName=firstName,
            lastName=lastName,
            email=email,
            isVerified=False,
        )
        sent = SendSignupCode(email, "RestaurantManager")
        if not sent:
            manager.delete()
            return Response({'message': 'ارسال کد با خطا مواجه شد.', 'status': 'error'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'کد ثبت‌نام ارسال شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class SignupVerifyView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not all([email, code]):
            return Response({'message': 'اطلاعات ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        time_threshold = timezone.now() - timedelta(seconds=120)
        code_obj = VerificationCode.objects.filter(
            email=email, code=code, used=False, sendDate__gte=time_threshold, role="RestaurantManager"
        ).first()

        if not code_obj:
            return Response({'message': 'کد نامعتبر یا منقضی شده.', 'status': 'error'},
                            status=status.HTTP_400_BAD_REQUEST)

        code_obj.used = True
        code_obj.save()

        manager = RestaurantManager.objects.filter(email=email).first()
        if not manager:
            return Response({'message': 'کاربر یافت نشد.', 'status': 'notFound'},
                            status=status.HTTP_404_NOT_FOUND)

        manager.isVerified = True
        manager.save()

        return Response({'message': 'ثبت‌نام با موفقیت تایید شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class LoginCodeView(APIView):
    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({'message': 'ایمیل وارد نشده است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        manager = RestaurantManager.objects.filter(email=email).first()
        if not manager:
            return Response({'message': 'کاربر یافت نشد.', 'status': 'notFound'},
                            status=status.HTTP_404_NOT_FOUND)

        if not manager.isVerified:
            return Response({'message': 'حساب کاربری شما فعال نیست.', 'status': 'notVerified'},
                            status=status.HTTP_403_FORBIDDEN)

        time_threshold = timezone.now() - timedelta(seconds=120)
        recent_code = VerificationCode.objects.filter(
            email=email, used=False, sendDate__gte=time_threshold, role="RestaurantManager"
        )

        if recent_code.exists():
            return Response({'message': 'کد قبلاً ارسال شده و هنوز معتبر است.', 'status': 'success'},
                            status=status.HTTP_200_OK)

        sent = SendLoginCode(email, "RestaurantManager")
        if not sent:
            return Response({'message': 'ارسال کد با خطا مواجه شد.', 'status': 'error'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'کد ورود ارسال شد.', 'status': 'success'},
                        status=status.HTTP_200_OK)


class LoginVerifyView(APIView):
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not all([email, code]):
            return Response({'message': 'اطلاعات ناقص است.', 'status': 'required'},
                            status=status.HTTP_400_BAD_REQUEST)

        time_threshold = timezone.now() - timedelta(seconds=120)
        code_obj = VerificationCode.objects.filter(
            email=email, code=code, used=False, sendDate__gte=time_threshold, role="RestaurantManager"
        ).first()

        if not code_obj:
            return Response({'message': 'کد نامعتبر یا منقضی شده.', 'status': 'error'},
                            status=status.HTTP_400_BAD_REQUEST)
        code_obj.used = True
        code_obj.save()

        manager = RestaurantManager.objects.filter(email=email).first()
        if not manager:
            return Response({'message': 'کاربر با این ایمیل پیدا نشد.', 'status': 'notFound'},
                            status=status.HTTP_404_NOT_FOUND)
        request.session['restaurantManager_login'] = {
            'id': manager.id,
            'email': manager.email
        }
        return Response({'message': 'ورود موفقیت‌آمیز بود.', 'status': 'success'},
                        status=status.HTTP_200_OK)



class CheckLoginView(APIView):
    def get(self, request):
        if getRestaurantManager(request):
            return Response({'message': 'لاگین است.', 'status': 'success'},
                        status=status.HTTP_200_OK)
        else:
            return Response({'message': 'لاگین نیست.', 'status': 'unauthorized'},
                            status=status.HTTP_401_UNAUTHORIZED)



class GetInformation(APIView):
    def get(self, request):
        manager = getRestaurantManager(request)
        if manager:
            return Response({'message': 'اطلاعات مدیر رستوران ارسال شد.', 'status': 'success',
                             'data' : {
                                 'firstName': manager.firstName,
                                 'lastName': manager.lastName,
                                 'email': manager.email,
                                 'hasRestaurant': Restaurant.objects.filter(owner=manager.id).exists(),
                             }}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'لاگین نیست.', 'status': 'unauthorized'},
                            status=status.HTTP_401_UNAUTHORIZED)