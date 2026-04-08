import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pickupService } from '../services/pickupService';
import toast from 'react-hot-toast';

export function usePickups(page = 0, size = 10) {
    return useQuery({
        queryKey: ['pickups', page, size],
        queryFn: () => pickupService.getAll(page, size),
        keepPreviousData: true,
    });
}

export function usePickup(id) {
    return useQuery({
        queryKey: ['pickups', id],
        queryFn: () => pickupService.getById(id),
        enabled: !!id,
    });
}

export function usePickupByDonation(donationId) {
    return useQuery({
        queryKey: ['pickups', 'donation', donationId],
        queryFn: () => pickupService.getByDonation(donationId),
        enabled: !!donationId,
    });
}

export function useRequestPickup() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: pickupService.requestPickup,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pickups'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Pickup requested successfully');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useUpdatePickup() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => pickupService.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pickups'] });
            toast.success('Pickup updated');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useCancelPickup() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: pickupService.cancel,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pickups'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Pickup cancelled');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useMarkPicked() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: pickupService.markPicked,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pickups'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Marked as picked up');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useMarkDelivered() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: pickupService.markDelivered,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pickups'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Marked as delivered');
        },
        onError: (err) => toast.error(err.message),
    });
}
