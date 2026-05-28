import { IFirst, IFirstState } from 'Shared/interfaces/general/interface';
import { RootState } from '../store';
import { createSelector } from '@reduxjs/toolkit';

export const firstSelector = (state: RootState): IFirstState => state.first;

export const getFirstSelector = createSelector (
    [firstSelector],
    (firstSelector): IFirst[] => firstSelector.firstList
);