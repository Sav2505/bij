export interface IFirst {
    field_1: number,
    field_2?: string,
};

export interface IFirstState {
    firstList: IFirst[],
};

export interface ILogin {
    id: number,
    time: string,
    name: string,
};