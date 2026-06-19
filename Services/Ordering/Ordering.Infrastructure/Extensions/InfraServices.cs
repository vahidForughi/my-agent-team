using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordering.Core.Repositories;
using Ordering.Infrastructure.Data;
using Ordering.Infrastructure.Repositories;

namespace Ordering.Infrastructure.Extensions;

public static class InfraServices
{
    public static IServiceCollection AddInfraServices(this IServiceCollection serviceCollection,
        IConfiguration configuration)
    {
        serviceCollection.AddDbContext<OrderContext>(options => options
            .UseSqlServer(
                configuration.GetConnectionString("OrderingConnectionString"),
                sqlServerOptions => sqlServerOptions.EnableRetryOnFailure())
            .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));
        serviceCollection.AddScoped(typeof(IAsyncRepository<>), typeof(RepositoryBase<>));
        serviceCollection.AddScoped<IOrderRepository, OrderRepository>();
        serviceCollection.AddScoped<IActivityRepository, ActivityRepository>();
        return serviceCollection;
    }
}