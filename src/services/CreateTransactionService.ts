// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // TODO

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (value > total) {
        throw new AppError('Saldo insulficiente!');
      }
    }
    const categoriesRepository = getRepository(Category);

    const categoryFind = await categoriesRepository.findOne({
      where: { title: category },
    });

    const transactionNew = {
      title,
      value,
      type,
      category: {},
    };

    if (categoryFind) {
      transactionNew.category = categoryFind;
    } else {
      const categoryNew = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryNew);

      transactionNew.category = categoryNew;
    }

    const transactionCreated = transactionsRepository.create(transactionNew);

    await transactionsRepository.save(transactionCreated);

    return transactionCreated;
  }
}

export default CreateTransactionService;
