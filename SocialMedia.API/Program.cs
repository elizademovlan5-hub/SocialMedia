
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SocialMedia.Application.Notifications.Interfaces;
using SocialMedia.Domain.Entities;
using SocialMedia.Infrastructure.Notifications;
using SocialMedia.Infrastructure.Persistence;
using SocialMedia.Infrastructure.Realtime;
using SocialMedia.Infrastructure.RealTime;
using System;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =========================
// Controllers
// =========================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions
            .Converters
            .Add(new JsonStringEnumConverter());
    });


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// =========================
// Database
// =========================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthHelper, AuthHelper>();
builder.Services.AddScoped<IFileStorageService, CloudinaryStorageService>();

builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddSignalR();
// =========================
// Identity
// =========================

builder.Services
    .AddIdentityCore<AppUser>(options =>
    {
        // Password
        options.Password.RequiredLength = 6;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;

        // User
        options.User.RequireUniqueEmail = true;

        // Lockout
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.AllowedForNewUsers = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();


// =========================
// JWT Authentication
// =========================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is missing.");

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey
                        )
                    ),

                ClockSkew =
                    TimeSpan.Zero
            };

        options.Events =
            new JwtBearerEvents
            {
                OnMessageReceived =
                    context =>
                    {
                        var accessToken =
                            context.Request.Query[
                                "access_token"
                            ];

                        var path =
                            context.HttpContext
                                .Request.Path;

                        if (
                            !string.IsNullOrEmpty(
                                accessToken
                            ) &&
                            path.StartsWithSegments(
                                "/hubs"
                            )
                        )
                        {
                            context.Token =
                                accessToken;
                        }

                        return Task.CompletedTask;
                    }
            };
    });


// =========================
// Authorization
// =========================

builder.Services.AddAuthorization();


// =========================
// CORS
// React frontend üçün
// =========================

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


// =========================
// SignalR
// =========================

var app = builder.Build();


// =========================
// Middleware Pipeline
// =========================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("ReactClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR hub əlavə edəndə:
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHub<ChatHub>("/hubs/chat");

app.Run();