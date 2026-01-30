FROM mcr.microsoft.com/dotnet/sdk:10.0

RUN dotnet tool install -g dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

WORKDIR /app

COPY . .

WORKDIR /app/JEDI_DO

ENTRYPOINT ["dotnet", "watch", "run"]
