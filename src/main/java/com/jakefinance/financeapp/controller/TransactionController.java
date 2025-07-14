package com.jakefinance.financeapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jakefinance.financeapp.model.Transaction;
import com.jakefinance.financeapp.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private static final DateTimeFormatter CSV_DATE_FORMAT = DateTimeFormatter.ofPattern("M/d/yyyy");

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        List<Transaction> transactions = transactionService.getAllTransactions(token);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(@RequestBody Transaction transaction,
                                                      @RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        Transaction saved = transactionService.addTransaction(transaction, token);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }

    @GetMapping("/export")
    public ResponseEntity<List<Transaction>> exportTransactions(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        List<Transaction> transactions = transactionService.getAllTransactions(token);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importTransactions(@RequestParam("file") MultipartFile file,
                                                     @RequestHeader("Authorization") String authHeader) {
        try {
            String filename = file.getOriginalFilename();
            List<Transaction> transactions;

            if (filename != null && filename.endsWith(".csv")) {
                transactions = parseCsv(file);
            } else {
                ObjectMapper mapper = new ObjectMapper();
                transactions = Arrays.asList(mapper.readValue(file.getInputStream(), Transaction[].class));
            }

            String token = extractToken(authHeader);
            transactionService.saveAll(transactions, token);
            return ResponseEntity.ok("Imported successfully");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid file");
        }
    }

    private List<Transaction> parseCsv(MultipartFile file) throws IOException {
        List<Transaction> transactions = new ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        String line;
        String[] headers = null;

        if ((line = reader.readLine()) != null) {
            headers = line.toLowerCase().split(",");
        } else {
            throw new IOException("CSV file is empty");
        }

        while ((line = reader.readLine()) != null) {
            String[] tokens = line.split(",", -1);
            if (tokens.length != headers.length) continue;

            try {
                Transaction t = new Transaction();

                for (int i = 0; i < headers.length; i++) {
                    String header = headers[i].trim();
                    String value = tokens[i].replaceAll("\"", "").trim();

                    switch (header) {
                        case "title": t.setTitle(value.isEmpty() ? "Untitled" : value); break;
                        case "amount":
                            if (value.isEmpty()) throw new IllegalArgumentException("Amount required");
                            t.setAmount(Double.parseDouble(value.replaceAll("[^\\d.-]", "")));
                            break;
                        case "type":
                            if (value.isEmpty()) throw new IllegalArgumentException("Type required");
                            t.setType(value.toLowerCase());
                            break;
                        case "category": t.setCategory(value.isEmpty() ? "Uncategorized" : value); break;
                        case "account":
                            if (value.isEmpty()) throw new IllegalArgumentException("Account required");
                            t.setAccount(value);
                            break;
                        case "date":
                            if (!value.isEmpty()) {
                                t.setDate(LocalDate.parse(value, CSV_DATE_FORMAT));
                            } else {
                                t.setDate(LocalDate.now());
                            }
                            break;
                        case "notes": t.setNotes(value); break;
                        default: break;
                    }
                }

                if (t.getAmount() == null || t.getType() == null || t.getAccount() == null) continue;

                transactions.add(t);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return transactions;
    }

    private String extractToken(String authHeader) {
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    }
}