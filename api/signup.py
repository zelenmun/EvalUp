# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from core.serializers import UserCreateSerializer


@api_view(['POST'])
def create_user(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():

        terms = serializer.validated_data['terms']
        fname = serializer.validated_data['firstName']
        lname = serializer.validated_data['lastName']
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']


        return Response({'result': True, 'message': 'Su cuenta ha sigo creada excitosamente'}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
