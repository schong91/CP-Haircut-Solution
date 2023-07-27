export interface User {
    uid?: string,
    personal_details: {
        name: string,
        password: string,
        address: string,
        phone_number: number,
        email: string,
        isBarber: string,
        user_photo: string
    },
    company_details: {
        work_company: string,
        work_company_phone: number
    }
    curr_location?: object,
    isAvailable?: boolean,
    isBook?: boolean
}