export interface Booking {
    bid?: string;
    userId: string;
    barberId: string;
    userLocation: {
        latitude: any;
        longitude: any;
        address: any;
    };
    barberLocation: {
        latitude: any;
        longitude: any;
        address: any;
    };
    createdAt: Date;
    status: string;
    endAt: Date;
}
