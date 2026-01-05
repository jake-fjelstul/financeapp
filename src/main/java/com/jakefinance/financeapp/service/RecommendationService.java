package com.jakefinance.financeapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jakefinance.financeapp.model.Goal;
import com.jakefinance.financeapp.model.Transaction;
import com.jakefinance.financeapp.repository.GoalRepository;
import com.jakefinance.financeapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final TransactionService transactionService;
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    // Product database - expanded for better recommendations
    private static final Map<String, List<Map<String, Object>>> PRODUCT_DATABASE = new HashMap<>();
    
    static {
        // Initialize product database
        PRODUCT_DATABASE.put("Food", Arrays.asList(
            createProduct(1, "Meal Prep Containers Set", "BPA-free glass containers perfect for meal prepping and saving money on food expenses.", 24.99, "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=meal+prep+containers"),
            createProduct(2, "Air Fryer", "Cook healthier meals with less oil. Save on dining out with restaurant-quality food at home.", 89.99, "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=air+fryer"),
            createProduct(3, "Coffee Maker", "Brew your own coffee and save hundreds per year compared to buying daily coffee.", 49.99, "https://images.unsplash.com/photo-1517668808823-d6c8b0e3b2e3?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=coffee+maker")
        ));
        
        PRODUCT_DATABASE.put("Travel", Arrays.asList(
            createProduct(4, "Travel Credit Card", "Earn points and miles on every purchase. Perfect for frequent travelers.", 0, "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop", "https://www.creditcards.com/travel/"),
            createProduct(5, "Luggage Set", "Durable, lightweight luggage that will last for years of travel adventures.", 129.99, "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=luggage+set"),
            createProduct(6, "Travel Insurance", "Protect your travel investments with comprehensive coverage at affordable rates.", 29.99, "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop", "https://www.travelinsurance.com/")
        ));
        
        PRODUCT_DATABASE.put("Rent", Arrays.asList(
            createProduct(7, "Smart Thermostat", "Save up to 23% on heating and cooling costs with intelligent temperature control.", 199.99, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=smart+thermostat"),
            createProduct(8, "LED Light Bulbs", "Energy-efficient bulbs that use 75% less energy and last 25x longer.", 19.99, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=led+light+bulbs"),
            createProduct(9, "Programmable Timer", "Automate your appliances to save energy and reduce utility bills.", 12.99, "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=programmable+timer")
        ));
        
        PRODUCT_DATABASE.put("Groceries", Arrays.asList(
            createProduct(10, "Grocery Delivery Service", "Save time and money with discounted grocery delivery subscriptions.", 9.99, "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop", "https://www.instacart.com/"),
            createProduct(11, "Reusable Shopping Bags", "Eco-friendly bags that help you save on bag fees and reduce waste.", 14.99, "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=reusable+shopping+bags")
        ));
        
        PRODUCT_DATABASE.put("default", Arrays.asList(
            createProduct(12, "Budgeting App Premium", "Advanced features to track expenses, set goals, and save more money.", 4.99, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", "https://www.mint.com/"),
            createProduct(13, "High-Yield Savings Account", "Earn more interest on your savings with competitive APY rates.", 0, "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop", "https://www.bankrate.com/banking/savings/"),
            createProduct(14, "Investment Platform", "Start investing with low fees and automated portfolio management.", 0, "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop", "https://www.wealthfront.com/"),
            createProduct(15, "Wireless Earbuds", "High-quality audio for work calls and entertainment. Save on replacement cables.", 79.99, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=wireless+earbuds"),
            createProduct(16, "Standing Desk Converter", "Improve productivity and health with an adjustable standing desk converter.", 149.99, "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=standing+desk+converter"),
            createProduct(17, "Fitness Tracker", "Monitor your health and activity to reduce medical expenses long-term.", 99.99, "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=fitness+tracker"),
            createProduct(18, "Portable Phone Charger", "Never run out of battery. Essential for travel and daily use.", 29.99, "https://images.unsplash.com/photo-1609091839311-d5365f5f087a?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=portable+phone+charger"),
            createProduct(19, "Ergonomic Office Chair", "Reduce back pain and improve productivity with proper seating.", 199.99, "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=ergonomic+office+chair"),
            createProduct(20, "Noise Cancelling Headphones", "Focus better at work and save on coffee shop expenses.", 149.99, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=noise+cancelling+headphones"),
            createProduct(21, "Meal Planning App Subscription", "Plan meals efficiently and reduce food waste.", 9.99, "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop", "https://www.mealime.com/"),
            createProduct(22, "Water Filter Pitcher", "Save money on bottled water with clean filtered tap water.", 34.99, "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=water+filter+pitcher"),
            createProduct(23, "Reusable Water Bottle", "Eco-friendly and cost-effective alternative to disposable bottles.", 24.99, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=reusable+water+bottle"),
            createProduct(24, "Electric Toothbrush", "Better oral health reduces dental expenses long-term.", 49.99, "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=electric+toothbrush"),
            createProduct(25, "Slow Cooker", "Cook large meals efficiently and save on dining out.", 39.99, "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=slow+cooker"),
            createProduct(26, "Bulk Food Storage Containers", "Buy in bulk and save money on groceries.", 29.99, "https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=bulk+food+storage"),
            createProduct(27, "Credit Score Monitoring", "Track your credit score for free and improve financial health.", 0, "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop", "https://www.creditkarma.com/"),
            createProduct(28, "Cashback Credit Card", "Earn money back on every purchase you make.", 0, "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop", "https://www.creditcards.com/cash-back/"),
            createProduct(29, "Expense Tracking App", "Automatically categorize expenses and find savings opportunities.", 0, "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", "https://www.youneedabudget.com/"),
            createProduct(30, "Solar Phone Charger", "Charge devices for free using solar power.", 39.99, "https://images.unsplash.com/photo-1609091839311-d5365f5f087a?w=400&h=300&fit=crop", "https://www.amazon.com/s?k=solar+phone+charger")
        ));
    }
    
    private static Map<String, Object> createProduct(int id, String name, String description, double price, String image, String url) {
        Map<String, Object> product = new HashMap<>();
        product.put("id", id);
        product.put("name", name);
        product.put("description", description);
        product.put("price", price);
        product.put("image", image);
        product.put("url", url);
        return product;
    }

    public RecommendationService(TransactionService transactionService,
                                        GoalRepository goalRepository,
                                        UserRepository userRepository) {
        this.transactionService = transactionService;
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> getRecommendations(String email, int page, int size) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Fetch user data
        List<Transaction> transactions = transactionService.getAllTransactions(email);
        List<Goal> goals = goalRepository.findByUser(user);
        
        // Analyze transactions
        Map<String, Double> categorySpending = new HashMap<>();
        for (Transaction t : transactions) {
            if (t.getType() != null && "expense".equals(t.getType()) && t.getCategory() != null) {
                String category = t.getCategory().trim();
                categorySpending.put(category, categorySpending.getOrDefault(category, 0.0) + t.getAmount());
            }
        }
        
        // Extract goal texts
        List<String> goalTexts = goals.stream()
                .filter(g -> !g.getCompleted())
                .map(Goal::getText)
                .collect(Collectors.toList());
        
        // Generate search query using LLM (or fallback to simple logic)
        String searchQuery = generateSearchQuery(categorySpending, goalTexts);
        
        // Get recommendations based on query
        List<Map<String, Object>> allProducts = getProductsByQuery(searchQuery, categorySpending, goalTexts);
        
        System.out.println(String.format("DEBUG: Total products before pagination: %d", allProducts.size()));
        if (allProducts.size() > 0) {
            System.out.println(String.format("DEBUG: First product ID: %s, Last product ID: %s", 
                allProducts.get(0).get("id"), 
                allProducts.get(allProducts.size() - 1).get("id")));
        }
        
        // Paginate results
        int start = page * size;
        int end = Math.min(start + size, allProducts.size());
        List<Map<String, Object>> paginatedProducts = start < allProducts.size() 
                ? allProducts.subList(start, end) 
                : new ArrayList<>();
        
        boolean hasMoreProducts = end < allProducts.size();
        
        System.out.println(String.format("Recommendations: page=%d, size=%d, total=%d, start=%d, end=%d, returned=%d, hasMore=%s", 
            page, size, allProducts.size(), start, end, paginatedProducts.size(), hasMoreProducts));
        
        // Debug: Log first few product IDs
        if (paginatedProducts.size() > 0) {
            System.out.println("Product IDs on this page: " + 
                paginatedProducts.stream()
                    .limit(5)
                    .map(p -> String.valueOf(p.get("id")))
                    .collect(Collectors.joining(", ")));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", paginatedProducts);
        response.put("page", page);
        response.put("size", size);
        response.put("total", allProducts.size());
        response.put("hasMore", Boolean.valueOf(hasMoreProducts)); // Explicitly convert to Boolean wrapper
        
        return response;
    }
    
    private String generateSearchQuery(Map<String, Double> categorySpending, List<String> goalTexts) {
        // Try to use Gemini API if available, otherwise use simple logic
        String geminiApiKey = System.getenv("GEMINI_API_KEY");
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            System.out.println("GEMINI_API_KEY found, attempting to use Gemini API (key length: " + geminiApiKey.length() + ")");
            try {
                return generateQueryWithGemini(categorySpending, goalTexts, geminiApiKey);
            } catch (Exception e) {
                System.err.println("Failed to use Gemini API: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("GEMINI_API_KEY not found, using simple keyword extraction");
        }
        
        // Fallback: Simple keyword extraction
        return generateSimpleQuery(categorySpending, goalTexts);
    }
    
    private String generateQueryWithGemini(Map<String, Double> categorySpending, List<String> goalTexts, String apiKey) throws IOException, InterruptedException {
        // Build context
        StringBuilder context = new StringBuilder("Based on the following financial data, generate 3-5 product search keywords:\n\n");
        context.append("Top Spending Categories:\n");
        categorySpending.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .forEach(e -> context.append("- ").append(e.getKey()).append(": $").append(e.getValue()).append("\n"));
        
        if (!goalTexts.isEmpty()) {
            context.append("\nUser Goals:\n");
            goalTexts.forEach(g -> context.append("- ").append(g).append("\n"));
        }
        
        context.append("\nGenerate comma-separated product search keywords that would help this user save money or achieve their goals.");
        
        // Escape JSON properly
        String promptText = context.toString();
        // Use ObjectMapper to properly escape JSON
        String requestBody;
        try {
            Map<String, Object> requestMap = new HashMap<>();
            Map<String, Object> contents = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", promptText);
            parts.add(part);
            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);
            List<Map<String, Object>> contentsList = new ArrayList<>();
            contentsList.add(content);
            requestMap.put("contents", contentsList);
            requestBody = objectMapper.writeValueAsString(requestMap);
        } catch (Exception e) {
            System.err.println("Failed to build Gemini request body: " + e.getMessage());
            throw new IOException("Failed to build request: " + e.getMessage());
        }
        
        // Try different model names in order of preference
        // Current Gemini models: gemini-2.5-flash (faster, cheaper), gemini-2.5-pro (more capable)
        String[] models = {"gemini-2.5-flash", "gemini-2.5-pro"};
        String[] apiVersions = {"v1", "v1beta"};
        
        IOException lastException = null;
        
        for (String model : models) {
            for (String version : apiVersions) {
                try {
                    String apiUrl = String.format(
                        "https://generativelanguage.googleapis.com/%s/models/%s:generateContent?key=%s",
                        version, model, apiKey
                    );
                    
                    System.out.println("Trying Gemini API: " + version + "/" + model);
                    
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create(apiUrl))
                            .header("Content-Type", "application/json")
                            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                            .build();
                    
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    
                    // Log response for debugging
                    System.out.println("Gemini API Response Status: " + response.statusCode() + " for " + version + "/" + model);
                    
                    if (response.statusCode() == 200) {
                        try {
                            JsonNode rootNode = objectMapper.readTree(response.body());
                            JsonNode candidates = rootNode.get("candidates");
                            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                                JsonNode content = candidates.get(0).get("content");
                                if (content != null) {
                                    JsonNode parts = content.get("parts");
                                    if (parts != null && parts.isArray() && parts.size() > 0) {
                                        JsonNode textNode = parts.get(0).get("text");
                                        if (textNode != null) {
                                            String generatedText = textNode.asText().trim();
                                            // Clean up potential markdown or extra quotes from LLM response
                                            generatedText = generatedText.replace("```", "").replace("json", "").replace("\"", "").trim();
                                            System.out.println("Gemini generated query using " + version + "/" + model + ": " + generatedText);
                                            return generatedText;
                                        }
                                    }
                                }
                            }
                            System.err.println("Gemini response structure unexpected. Full response: " + response.body());
                        } catch (Exception e) {
                            System.err.println("Failed to parse Gemini response: " + e.getMessage());
                            System.err.println("Response body: " + response.body());
                            e.printStackTrace();
                        }
                    } else {
                        // Only log error if it's not a 404 (model not found), we'll try next model
                        if (response.statusCode() != 404) {
                            System.err.println("Gemini API Error Response for " + version + "/" + model + ": " + response.body());
                        }
                    }
                } catch (IOException e) {
                    lastException = e;
                    // Continue to next model/version
                }
            }
        }
        
        // If we get here, all models/versions failed
        throw new IOException("Failed to get response from Gemini API after trying all models. Last error: " + 
            (lastException != null ? lastException.getMessage() : "Unknown error"));
    }
    
    private String generateSimpleQuery(Map<String, Double> categorySpending, List<String> goalTexts) {
        Set<String> keywords = new HashSet<>();
        
        // Add top categories
        categorySpending.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .forEach(e -> keywords.add(e.getKey().toLowerCase()));
        
        // Extract keywords from goals
        for (String goal : goalTexts) {
            String lowerGoal = goal.toLowerCase();
            if (lowerGoal.contains("travel")) keywords.add("travel");
            if (lowerGoal.contains("house") || lowerGoal.contains("home")) keywords.add("home");
            if (lowerGoal.contains("retire")) keywords.add("investment");
            if (lowerGoal.contains("debt")) keywords.add("debt");
            if (lowerGoal.contains("save")) keywords.add("savings");
            if (lowerGoal.contains("fitness") || lowerGoal.contains("health")) keywords.add("fitness");
        }
        
        return String.join(", ", keywords);
    }
    
    private List<Map<String, Object>> getProductsByQuery(String query, Map<String, Double> categorySpending, List<String> goalTexts) {
        List<Map<String, Object>> allProductsList = new ArrayList<>();
        
        // Get products based on top categories
        List<String> topCategories = categorySpending.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        for (String category : topCategories) {
            String categoryKey = PRODUCT_DATABASE.containsKey(category) ? category : "default";
            allProductsList.addAll(PRODUCT_DATABASE.getOrDefault(categoryKey, PRODUCT_DATABASE.get("default")));
        }
        
        // Add goal-based products
        for (String goal : goalTexts) {
            String lowerGoal = goal.toLowerCase();
            if (lowerGoal.contains("travel")) {
                allProductsList.addAll(PRODUCT_DATABASE.getOrDefault("Travel", PRODUCT_DATABASE.get("default")));
            }
            if (lowerGoal.contains("house") || lowerGoal.contains("home")) {
                allProductsList.addAll(PRODUCT_DATABASE.getOrDefault("Rent", PRODUCT_DATABASE.get("default")));
            }
            if (lowerGoal.contains("fitness") || lowerGoal.contains("health") || lowerGoal.contains("exercise")) {
                // Add fitness-related products from default
                allProductsList.addAll(PRODUCT_DATABASE.get("default").stream()
                    .filter(p -> {
                        String name = (String) p.get("name");
                        return name != null && (name.toLowerCase().contains("fitness") || name.toLowerCase().contains("tracker"));
                    })
                    .collect(Collectors.toList()));
            }
        }
        
        // If no matches, use all default products
        if (allProductsList.isEmpty()) {
            allProductsList.addAll(PRODUCT_DATABASE.get("default"));
        }
        
        // Always include some default products to ensure we have enough for pagination
        // Add all default products to ensure variety and enough items for infinite scroll
        allProductsList.addAll(PRODUCT_DATABASE.get("default"));
        
        // Remove duplicates by ID while maintaining order
        Map<Integer, Map<String, Object>> uniqueProducts = new LinkedHashMap<>();
        for (Map<String, Object> product : allProductsList) {
            Integer id = (Integer) product.get("id");
            if (!uniqueProducts.containsKey(id)) {
                uniqueProducts.put(id, product);
            }
        }
        
        List<Map<String, Object>> result = new ArrayList<>(uniqueProducts.values());
        
        // Ensure we have at least enough products for multiple pages (e.g., 24+ for page size 12)
        // If we still don't have enough, duplicate and modify IDs to create more variety
        int minProducts = 36; // At least 3 pages worth
        if (result.size() < minProducts) {
            int originalSize = result.size();
            for (int i = 0; result.size() < minProducts; i++) {
                Map<String, Object> original = result.get(i % originalSize);
                Map<String, Object> duplicate = new HashMap<>(original);
                duplicate.put("id", 1000 + result.size()); // Use high ID to avoid conflicts
                result.add(duplicate);
            }
        }
        
        return result;
    }
}

