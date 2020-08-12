
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;

GO

CREATE TABLE [JediDoItem] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NULL,
    [JediDoTypeId] int NULL,
    [Completed] bit NOT NULL,
    [Secret] nvarchar(max) NULL,
    CONSTRAINT [PK_JediDoItem] PRIMARY KEY ([Id])
);

GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20200812021652_InitialCreate', N'3.1.7');

GO
