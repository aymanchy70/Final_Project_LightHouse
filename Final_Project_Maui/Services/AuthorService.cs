using Final_Project_Maui.Models;
using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Text;

namespace Final_Project_Maui.Services
{
    public class AuthorService
    {
        private readonly HttpClient _http;

        public AuthorService(HttpClient http)
        {
            _http = http;
        }

        public async Task<List<AuthorDto>> GetAuthorsAsync()
        {
            var response = await _http.GetFromJsonAsync<List<AuthorDto>>("api/Author");
            return response ?? new List<AuthorDto>();
        }

        public async Task<AuthorDto?> GetAuthorByIdAsync(int id)
        {
            return await _http.GetFromJsonAsync<AuthorDto>($"api/Author/{id}");
        }

        public async Task CreateAuthorAsync(AuthorDto author)
        {
            // Convert to form data because API expects [FromForm]
            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(author.FullName), "FullName");
            if (author.Pseudonym != null) formData.Add(new StringContent(author.Pseudonym), "Pseudonym");
            if (author.DateOfBirth.HasValue) formData.Add(new StringContent(author.DateOfBirth.Value.ToString("yyyy-MM-dd")), "DateOfBirth");
            if (author.DateOfDeath.HasValue) formData.Add(new StringContent(author.DateOfDeath.Value.ToString("yyyy-MM-dd")), "DateOfDeath");
            if (author.Nationality != null) formData.Add(new StringContent(author.Nationality), "Nationality");
            if (author.Biography != null) formData.Add(new StringContent(author.Biography), "Biography");
            if (author.Email != null) formData.Add(new StringContent(author.Email), "Email");
            // PhotoFile is skipped for now

            var response = await _http.PostAsync("api/Author", formData);
            response.EnsureSuccessStatusCode();
        }

        public async Task UpdateAuthorAsync(int id, AuthorDto author)
        {
            var formData = new MultipartFormDataContent();
            formData.Add(new StringContent(author.FullName), "FullName");
            if (author.Pseudonym != null) formData.Add(new StringContent(author.Pseudonym), "Pseudonym");
            if (author.DateOfBirth.HasValue) formData.Add(new StringContent(author.DateOfBirth.Value.ToString("yyyy-MM-dd")), "DateOfBirth");
            if (author.DateOfDeath.HasValue) formData.Add(new StringContent(author.DateOfDeath.Value.ToString("yyyy-MM-dd")), "DateOfDeath");
            if (author.Nationality != null) formData.Add(new StringContent(author.Nationality), "Nationality");
            if (author.Biography != null) formData.Add(new StringContent(author.Biography), "Biography");
            if (author.Email != null) formData.Add(new StringContent(author.Email), "Email");

            var response = await _http.PutAsync($"api/Author/{id}", formData);
            response.EnsureSuccessStatusCode();
        }

        public async Task DeleteAuthorAsync(int id)
        {
            await _http.DeleteAsync($"api/Author/{id}");
        }
    }
}
