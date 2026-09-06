package com.expensetracker.config;

import com.expensetracker.entity.Category;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Data initializer seeding default global categories on application startup.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        boolean hasGlobalCategories = categoryRepository.findAll().stream().anyMatch(c -> c.getUser() == null);
        if (!hasGlobalCategories) {
            List<Category> defaultCategories = List.of(
                    Category.builder().name("Housing").type(CategoryType.EXPENSE).description("Rent, mortgage, and home maintenance").user(null).build(),
                    Category.builder().name("Food & Dining").type(CategoryType.EXPENSE).description("Groceries, restaurants, and coffee").user(null).build(),
                    Category.builder().name("Transportation").type(CategoryType.EXPENSE).description("Fuel, public transit, and car service").user(null).build(),
                    Category.builder().name("Utilities").type(CategoryType.EXPENSE).description("Electricity, water, gas, and internet").user(null).build(),
                    Category.builder().name("Entertainment").type(CategoryType.EXPENSE).description("Movies, streaming, and hobbies").user(null).build(),
                    Category.builder().name("Healthcare").type(CategoryType.EXPENSE).description("Medical bills, pharmacy, and wellness").user(null).build(),
                    Category.builder().name("Salary").type(CategoryType.INCOME).description("Monthly employment wages").user(null).build(),
                    Category.builder().name("Freelance").type(CategoryType.INCOME).description("Side gigs and consulting revenue").user(null).build(),
                    Category.builder().name("Investments").type(CategoryType.INCOME).description("Dividends, interest, and capital gains").user(null).build()
            );

            categoryRepository.saveAll(defaultCategories);
            System.out.println("✅ Default global categories seeded successfully (" + defaultCategories.size() + " categories).");
        }
    }
}
