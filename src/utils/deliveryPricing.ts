export const deliveryPricing: Record<string, { baseCost: number, areas?: Record<string, number> }> = {
    "Lagos": {
        baseCost: 3000,
        areas: {
            "Alimosho (Command, Iyana Ipaja, Egbeda, Ayobo)": 1500,
            "Agege / Ogba": 2000,
            "Ikeja / Maryland / Anthony": 2500,
            "Oshodi / Isolo / Mushin": 2500,
            "Surulere / Yaba / Ebute Metta": 3000,
            "Gbagada / Bariga / Somolu": 3000,
            "Victoria Island / Ikoyi": 3500,
            "Lekki Phase 1 / Oniru": 3500,
            "Chevron / Ajah": 4500,
            "Sangotedo / Ibeju-Lekki / Epe": 6000,
            "Ikorodu Central / Agric": 3500,
            "Ikorodu Outskirts (Imota, Ijede)": 4500,
            "Festac / Mile 2 / Amuwo": 3000,
            "Ojo / Alaba / Trade Fair": 3500,
            "Badagry": 5000
        }
    },
    "Ogun": {
        baseCost: 5000,
        areas: {
            "Sango / Ota / Ifo": 3000,
            "Mowe / Ibafo / Arepo": 3500,
            "Abeokuta": 5000,
            "Ijebu Ode / Sagamu": 5000,
            "Other Ogun Areas": 6000
        }
    },
    "Oyo": { baseCost: 6000 },
    "Osun": { baseCost: 6000 },
    "Ondo": { baseCost: 6000 },
    "Ekiti": { baseCost: 6000 },
    "Edo": { baseCost: 7000 },
    "Delta": { baseCost: 7500 },
    "Rivers": { baseCost: 8500 },
    "Bayelsa": { baseCost: 8500 },
    "Cross River": { baseCost: 9000 },
    "Akwa Ibom": { baseCost: 9000 },
    "Abuja (FCT)": { baseCost: 8000 },
    "Kwara": { baseCost: 7000 },
    "Kogi": { baseCost: 7500 },
    "Benue": { baseCost: 8500 },
    "Niger": { baseCost: 8500 },
    "Nasarawa": { baseCost: 8500 },
    "Plateau": { baseCost: 9000 },
    "Enugu": { baseCost: 8000 },
    "Anambra": { baseCost: 8000 },
    "Imo": { baseCost: 8000 },
    "Abia": { baseCost: 8500 },
    "Ebonyi": { baseCost: 8500 },
    "Kano": { baseCost: 9000 },
    "Kaduna": { baseCost: 8500 },
    "Katsina": { baseCost: 10000 },
    "Jigawa": { baseCost: 10000 },
    "Sokoto": { baseCost: 11000 },
    "Zamfara": { baseCost: 11000 },
    "Kebbi": { baseCost: 11000 },
    "Bauchi": { baseCost: 10000 },
    "Gombe": { baseCost: 10000 },
    "Taraba": { baseCost: 11000 },
    "Adamawa": { baseCost: 11000 },
    "Yobe": { baseCost: 11000 },
    "Borno": { baseCost: 12000 }
};

export function getDeliveryCost(state: string, area?: string): number {
    const statePricing = deliveryPricing[state];
    if (!statePricing) return 5000; // Default fallback
    if (area && statePricing.areas && statePricing.areas[area]) {
        return statePricing.areas[area];
    }
    return statePricing.baseCost;
}
