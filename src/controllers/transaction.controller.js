const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * Create Transaction
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    /**
     * 2. Validate accounts
     */
    const fromUserAccount = await accountModel.findById(fromAccount)
    const toUserAccount = await accountModel.findById(toAccount)

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
     * 3. Check idempotency
     */
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey
    })

    if (existingTransaction) {

        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: existingTransaction
            })
        }

        if (existingTransaction.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing",
                transaction: existingTransaction
            })
        }

        if (
            existingTransaction.status === "FAILED" ||
            existingTransaction.status === "REVERSED"
        ) {
            return res.status(400).json({
                message: "Previous transaction failed or reversed. Please retry."
            })
        }
    }

    /**
     * 4. Check account status
     */
    if (
        fromUserAccount.status !== "ACTIVE" ||
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message: "Both accounts must be ACTIVE"
        })
    }

    /**
     * 5. Check sender balance
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance: ${balance}`
        })
    }

    let session;

    try {

        /**
         * 6. Start MongoDB transaction session
         */
        session = await mongoose.startSession()
        session.startTransaction()

        /**
         * 7. Create transaction (PENDING)
         */
        const transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        /**
         * 8. Create DEBIT ledger entry
         */
        await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        /**
         * Optional delay simulation
         * Remove in production
         */
        // await new Promise(resolve => setTimeout(resolve, 5000))

        /**
         * 9. Create CREDIT ledger entry
         */
        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        /**
         * 10. Mark transaction COMPLETED
         */
        transaction.status = "COMPLETED"
        await transaction.save({ session })

        /**
         * 11. Commit transaction
         */
        await session.commitTransaction()
        session.endSession()

        /**
         * 12. Send email notification
         */
        await emailService.sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            toAccount
        )

        /**
         * 13. Return response
         */
        return res.status(201).json({
            message: "Transaction completed successfully",
            transaction
        })

    } catch (error) {

        console.log(error)

        if (session) {
            await session.abortTransaction()
            session.endSession()
        }

        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        })
    }
}

/**
 * Create Initial Funds Transaction
 */

async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findById(toAccount)

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    let session;

    try {

        session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        /**
         * DEBIT entry
         */
        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        /**
         * CREDIT entry
         */
        await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        /**
         * Mark completed
         */
        transaction.status = "COMPLETED"
        await transaction.save({ session })

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction
        })

    } catch (error) {

        console.log(error)

        if (session) {
            await session.abortTransaction()
            session.endSession()
        }

        return res.status(500).json({
            message: "Initial funds transaction failed",
            error: error.message
        })
    }
}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}