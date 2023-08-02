import { create } from 'zustand'

export const useGameboyStore = create((set) => ({
    isOn: false,
    targets: [
        {
            id: 1,
            position: [2, 0, -2]
        }
    ],
    addTarget: (target) => set((state) => ({ targets: [...state.targets, target] })),
    removeTarget: (target) => set((state) => ({ targets: state.targets.filter((t) => t.id !== target.id) })),
}))