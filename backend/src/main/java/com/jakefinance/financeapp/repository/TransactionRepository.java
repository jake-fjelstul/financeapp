package com.jakefinance.financeapp.repository;

import com.jakefinance.financeapp.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccount(String account);
    List<Transaction> findByDateBetween(LocalDate start, LocalDate end);
    List<Transaction> findByAccountAndDateBetween(String account, LocalDate start, LocalDate end);
}
