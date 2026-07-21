using FinalProject_API.Entities;
using Microsoft.AspNetCore.Identity;

namespace FinalProject_API.Data
{
    public class SeedData
    {
        // ========== 1. Identity Seed (Roles + Admin User) ==========
        public static async Task InitializeIdentityAsync(
            RoleManager<IdentityRole<int>> roleManager,
            UserManager<IdentityUser<int>> userManager,
            AppDbContext context)
        {
            // 1. Create Roles (existing)
            string[] roles = { "Admin", "User" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(role));
                    Console.WriteLine($"✓ Role created: {role}");
                }
            }

            // 2. Create Admin User (existing)
            var adminEmail = "admin@library.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new IdentityUser<int>
                {
                    UserName = adminEmail,
                    Email = adminEmail
                };
                var result = await userManager.CreateAsync(adminUser, "Admin@123");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    Console.WriteLine("✓ Admin user created with Admin role");
                }
            }
            else
            {
                var isAdmin = await userManager.IsInRoleAsync(adminUser, "Admin");
                if (!isAdmin)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    Console.WriteLine("✓ Admin role added to existing admin user");
                }
            }

            // 3. Seed default permissions (NEW) – wrapped in try/catch to prevent startup crash
            try
            {
                string[] permissions = {
                    "ManageBooks", "ManageMembers", "ManageMembershipTypes", "ManageFineRules",
                    "ManageAuthors", "ManagePublishers", "ManageSuppliers", "ManageFloors",
                    "ManageSections", "ManageRacks", "ManageShelves", "ManagePhysicalCopies",
                    "ManagePurchaseOrders", "ManageGRN", "ApproveBorrowings", "ManageReservations",
                    "ManagePayments", "ViewReports", "ManageRoles"
                };

                foreach (var perm in permissions)
                {
                    if (!context.Permissions.Any(p => p.Name == perm))
                    {
                        context.Permissions.Add(new Permission { Name = perm });
                    }
                }
                await context.SaveChangesAsync();

                // 4. Assign all permissions to Admin role (both claims and join table)
                var adminRole = await roleManager.FindByNameAsync("Admin");
                if (adminRole != null)
                {
                    foreach (var perm in context.Permissions)
                    {
                        var claim = new System.Security.Claims.Claim("Permission", perm.Name);
                        var existingClaims = await roleManager.GetClaimsAsync(adminRole);
                        if (!existingClaims.Any(c => c.Type == "Permission" && c.Value == perm.Name))
                        {
                            await roleManager.AddClaimAsync(adminRole, claim);
                        }

                        if (!context.RolePermissions.Any(rp => rp.RoleId == adminRole.Id && rp.PermissionId == perm.Id))
                        {
                            context.RolePermissions.Add(new RolePermission
                            {
                                RoleId = adminRole.Id,
                                PermissionId = perm.Id
                            });
                        }
                    }
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Permission seeding skipped (tables may not exist yet): {ex.Message}");
            }

            // 5. Seed essential FineRules (LostBook, DamagedBook) – always run
            try
            {
                if (!context.FineRules.Any(f => f.RuleName == "LostBook"))
                {
                    context.FineRules.Add(new FineRule
                    {
                        RuleName = "LostBook",
                        FineType = "Percentage",
                        PercentageOfBookPrice = 100,
                        GracePeriodDays = 0
                    });
                }
                if (!context.FineRules.Any(f => f.RuleName == "DamagedBook"))
                {
                    context.FineRules.Add(new FineRule
                    {
                        RuleName = "DamagedBook",
                        FineType = "Percentage",
                        PercentageOfBookPrice = 50,
                        GracePeriodDays = 0
                    });
                }
                await context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ FineRule seeding failed: {ex.Message}");
            }
        }

        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Only seed if no categories exist
            if (context.ItemCategories.Any())
                return;

            var categories = new List<ItemCategory>
            {
                new ItemCategory { CategoryName = "Fiction", CategoryDescription = "Fictional books and novels" },
                new ItemCategory { CategoryName = "Science", CategoryDescription = "Science and technology books" },
                new ItemCategory { CategoryName = "History", CategoryDescription = "Historical books and biographies" },
                new ItemCategory { CategoryName = "Children", CategoryDescription = "Books for kids and young readers" }
            };

            await context.ItemCategories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }
    }
}