package com.jakefinance.financeapp.service;

import com.jakefinance.financeapp.model.Transaction;
import com.jakefinance.financeapp.model.User;
import com.jakefinance.financeapp.repository.TransactionRepository;
import com.jakefinance.financeapp.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, JwtService jwtService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public List<Transaction> getAllTransactions(String token) {
        User user = extractUser(token);
        return transactionRepository.findByUser(user);
    }

    public Transaction addTransaction(Transaction transaction, String token) {
        User user = extractUser(token);
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    public Optional<Transaction> getTransaction(Long id) {
        return transactionRepository.findById(id);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public void saveAll(List<Transaction> transactions, String token) {
        User user = extractUser(token);
        for (Transaction t : transactions) {
            t.setUser(user);
        }
        transactionRepository.saveAll(transactions);
    }

    private User extractUser(String token) {
        String email = jwtService.extractEmail(token);
        return userRepository.findByEmail(email).orElseThrow(() ->
            new IllegalArgumentException("User not found for token: " + email));
    }
}
