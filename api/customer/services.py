from customer.models import Customer

def getCustomer(request):
    customer = request.session.get('customer_login')
    if customer:
        return Customer.objects.get(id=customer['id'], email=customer['email'])
    return None
