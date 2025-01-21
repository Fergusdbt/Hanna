from django.shortcuts import redirect

from functools import wraps

# Decorator function to check if user is logged in
def login_required(f):
    @wraps(f)

    def decorated_function(request, *args, **kwargs):

        if not request.user.is_authenticated:
            return redirect("home:login")
        return f(request, *args, **kwargs)

    return decorated_function
