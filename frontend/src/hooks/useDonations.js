import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationService } from '../services/donationService';
import toast from 'react-hot-toast';

export function useDonationSearch(params) {
    return useQuery({
        queryKey: ['donations', 'search', params],
        queryFn: () => donationService.search(params),
        keepPreviousData: true,
    });
}

export function useDonation(id) {
    return useQuery({
        queryKey: ['donations', id],
        queryFn: () => donationService.getById(id),
        enabled: !!id,
    });
}

export function useMyDonations(donorId) {
    return useQuery({
        queryKey: ['donations', 'donor', donorId],
        queryFn: () => donationService.getByDonor(donorId),
        enabled: !!donorId,
    });
}

export function useNearbyDonations(params) {
    return useQuery({
        queryKey: ['donations', 'nearby', params],
        queryFn: () => donationService.searchNearby(params),
        enabled: !!(params?.lat && params?.lon),
    });
}

export function useCreateDonation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ donationData, imageFile }) => donationService.create(donationData, imageFile),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Donation created successfully');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useAdvanceDonationStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => donationService.advanceStatus(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Status advanced');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useNgoAccept() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ donationId, ngoId }) => donationService.ngoAccept(donationId, ngoId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations'] });
            qc.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Donation accepted — volunteers have been notified');
        },
        onError: (err) => toast.error(err.message),
    });
}

export function useUploadDonationImage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, imageFile }) => donationService.uploadImage(id, imageFile),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donations'] });
            toast.success('Image uploaded');
        },
        onError: (err) => toast.error(err.message),
    });
}
