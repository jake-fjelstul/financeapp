package com.jakefinance.financeapp.repository;

import com.jakefinance.financeapp.model.Transaction;
import com.jakefinance.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
}
