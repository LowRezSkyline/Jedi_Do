FROM mcr.microsoft.com/dotnet/core/sdk:3.1

# install ef tools 
RUN dotnet tool install -g dotnet-ef --version 3.1.0
# add ef tools to path 
ENV PATH $PATH:/root/.dotnet/tools

WORKDIR /app

COPY ./ .

WORKDIR /app/JEDI_DO

RUN apt-get update
RUN apt-get install -y sqlite3 
RUN apt-get install -y libsqlite3-dev


ENTRYPOINT ["dotnet", "watch" ,"run"]

# docker run -it -p 5000:5000 -v C:\Users\nicchl01\Downloads\projects\Core\DatingApp.Api:/app -w="/app" core-api bash