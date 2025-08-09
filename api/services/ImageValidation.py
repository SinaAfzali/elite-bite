
def ImageValidation(image_file):
    allowed_types = ['image/jpeg', 'image/png', 'image/jpg']
    if not image_file:
        return {'valid': False, 'message': 'تصویر ارسال نشده است.'}
    elif image_file.content_type not in allowed_types:
        return {'valid': False, 'message': 'فرمت تصویر نامعتبر است. فقط jpg، jpeg و png مجاز هستند.'}
    elif image_file.size > 1024 * 1024:
        return {'valid': False, 'message': 'حجم عکس نباید از یک مگابایت بیشتر باشد.'}
    else:
        return {'valid': True, 'message': 'عکس قابل قبول است.'}