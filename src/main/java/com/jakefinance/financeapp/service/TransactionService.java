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

    public TransactionService(TransactionRepository transactionRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<Transaction> getAllTransactions(String email) {
        User user = getUserByEmail(email);
        return transactionRepository.findByUser(user);
    }

    public Transaction addTransaction(Transaction transaction, String email) {
        User user = getUserByEmail(email);
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    public Optional<Transaction> getTransaction(Long id) {
        return transactionRepository.findById(id);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public void saveAll(List<Transaction> transactions, String email) {
        User user = getUserByEmail(email);
        for (Transaction t : transactions) {
            t.setUser(user);
        }
        transactionRepository.saveAll(transactions);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
    }
}
