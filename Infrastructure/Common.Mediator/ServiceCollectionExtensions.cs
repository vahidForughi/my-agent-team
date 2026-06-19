using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace Common.Mediator;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers <see cref="IMediator"/> and all <see cref="IRequestHandler{TRequest, TResponse}"/>
    /// implementations discovered in the supplied assemblies as transient services.
    /// Mirrors the call shape of <c>AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(...))</c>.
    /// </summary>
    public static IServiceCollection AddMediator(this IServiceCollection services, params Assembly[] assemblies)
    {
        // Scoped (not singleton): the mediator captures the IServiceProvider injected into it,
        // and resolves handlers from it. A singleton would capture the root provider and fail to
        // resolve scoped handler dependencies (e.g. repositories) with
        // "Cannot resolve scoped service ... from root provider". Scoped gives it the
        // per-request provider, matching how MediatR registers IMediator.
        services.AddScoped<IMediator, Mediator>();

        var handlerInterface = typeof(IRequestHandler<,>);
        foreach (var asm in assemblies.Distinct())
        {
            foreach (var type in asm.GetTypes())
            {
                if (type.IsAbstract || type.IsInterface) continue;
                foreach (var iface in type.GetInterfaces())
                {
                    if (!iface.IsGenericType) continue;
                    if (iface.GetGenericTypeDefinition() == handlerInterface)
                    {
                        services.AddTransient(iface, type);
                    }
                }
            }
        }

        return services;
    }
}
