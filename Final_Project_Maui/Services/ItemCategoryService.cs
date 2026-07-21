using Final_Project_Maui.Models;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace Final_Project_Maui.Services
{
    public class ItemCategoryService
    {
        private readonly HttpClient _http;

        public ItemCategoryService(HttpClient http)
        {
            _http = http;
        }

        public async Task<List<ItemCategoryDto>> GetCategoriesAsync()
        {
            var response = await _http.GetFromJsonAsync<List<ItemCategoryDto>>("api/ItemCategory");
            return response ?? new List<ItemCategoryDto>();
        }

        public async Task<ItemCategoryDto?> GetCategoryByIdAsync(int id)
        {
            return await _http.GetFromJsonAsync<ItemCategoryDto>($"api/ItemCategory/{id}");
        }

        public async Task<ItemCategoryDto> CreateCategoryAsync(ItemCategoryDto category)
        {
            var request = new
            {
                category.CategoryName,
                category.CategoryDescription
            };
            var response = await _http.PostAsJsonAsync("api/ItemCategory", request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<ItemCategoryDto>() ?? new ItemCategoryDto();
        }

        public async Task UpdateCategoryAsync(int id, ItemCategoryDto category)
        {
            var request = new
            {
                category.CategoryName,
                category.CategoryDescription
            };
            await _http.PutAsJsonAsync($"api/ItemCategory/{id}", request);
        }

        public async Task DeleteCategoryAsync(int id)
        {
            await _http.DeleteAsync($"api/ItemCategory/{id}");
        }
    }
}
