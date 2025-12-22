using Asp.Versioning;
using Catalog.Application.Handlers;
using Catalog.Core.Repositories;
using Catalog.Infrastructure.Data;
using Catalog.Infrastructure.Repositories;
using Common.Logging;
using Serilog;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//Add Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy => { policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin(); });
});

//Serilog configuration
builder.Host.UseSerilog(Logging.ConfigureLogger);

builder.Services.AddControllers();
// Add API Versioning
builder.Services.AddApiVersioning(options =>
{
    options.ReportApiVersions = true;
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new ApiVersion(1, 0);
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Catalog.API", Version = "v1" });
});

//Register AutoMapper
builder.Services.AddAutoMapper(typeof(Program).Assembly);

//Register Mediatr
var assemblies = new Assembly[]
{
    Assembly.GetExecutingAssembly(),
    typeof(GetAllBrandsHandler).Assembly
};
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(assemblies));

//Register Application Services
builder.Services.AddScoped<ICatalogContext, CatalogContext>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IBrandRepository, ProductRepository>();
builder.Services.AddScoped<ITypesRepository, ProductRepository>();

//Register AWS S3 Configuration
builder.Services.Configure<Catalog.Infrastructure.Services.AwsS3Settings>(
    builder.Configuration.GetSection("AWS:S3"));
builder.Services.Configure<Catalog.Infrastructure.Services.ImageSettings>(
    builder.Configuration.GetSection("ImageSettings"));

//Register AWS S3 Client with LocalStack support
var useLocalStack = builder.Configuration.GetValue<bool>("USE_LOCALSTACK");
var awsEndpointUrl = builder.Configuration["AWS_ENDPOINT_URL"];

if (useLocalStack && !string.IsNullOrEmpty(awsEndpointUrl))
{
    // Configure for LocalStack
    var s3Config = new Amazon.S3.AmazonS3Config
    {
        ServiceURL = awsEndpointUrl,
        ForcePathStyle = true,
        AuthenticationRegion = "us-east-1",
        UseHttp = true
    };
    builder.Services.AddSingleton<Amazon.S3.IAmazonS3>(sp =>
        new Amazon.S3.AmazonS3Client(s3Config));
}
else
{
    // Configure for real AWS
    var awsOptions = builder.Configuration.GetAWSOptions();
    awsOptions.Region = Amazon.RegionEndpoint.GetBySystemName(
        builder.Configuration["AWS:S3:Region"] ?? "ap-southeast-1");
    builder.Services.AddDefaultAWSOptions(awsOptions);
    builder.Services.AddAWSService<Amazon.S3.IAmazonS3>();
}

//Register Image Storage Service
builder.Services.AddScoped<Catalog.Core.Services.IImageStorageService,
    Catalog.Infrastructure.Services.S3ImageStorageService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");
app.UseAuthorization();

app.MapControllers();

app.Run();