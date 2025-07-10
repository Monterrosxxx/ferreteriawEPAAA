import { Schema, model } from "mongoose";

const claimsSchema = new Schema({
    customerId: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
    branchId: {
        type: Schema.Types.ObjectId,
        ref: "Branch",
        required: false
    },
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "Employees",
        required: false
    },
    subject: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 200,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 1000,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'closed'],
        default: 'pending'
    },
    response: {
        type: String,
        minLength: 10,
        maxLength: 1000,
        trim: true
    },
    level: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Claims", claimsSchema);