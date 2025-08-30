import { Household, useHousehold } from '@/hooks/useHousehold';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface HouseholdSettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const HouseholdSettings: React.FC<HouseholdSettingsProps> = ({ open, onOpenChange }) => {
    const {
        currentHousehold,
        householdMembers,
        isOriginator,
        loading,
        updateHousehold,
        // ... (other functions)
    } = useHousehold();

    const [newHouseholdName, setNewHouseholdName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Sync input field with current household name once data is loaded
    useEffect(() => {
        if (currentHousehold && !loading) {
            setNewHouseholdName(currentHousehold.name);
        }
    }, [currentHousehold, loading]);

    const handleUpdateHousehold = async () => {
        if (!currentHousehold || !newHouseholdName.trim() || !isOriginator) return;
        setIsUpdating(true);
        await updateHousehold(currentHousehold.id, newHouseholdName);
        setIsUpdating(false);
    };

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex justify-center p-8">
                        Loading household data...
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!currentHousehold) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <div className="flex justify-center p-8">
                        No active household found.
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Household Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Edit Household Name */}
                    <div className="space-y-2">
                        <Label htmlFor="household-name">Household Name</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="household-name"
                                value={newHouseholdName}
                                onChange={(e) => setNewHouseholdName(e.target.value)}
                                disabled={!isOriginator}
                            />
                            {isOriginator && (
                                <Button
                                    onClick={handleUpdateHousehold}
                                    disabled={!newHouseholdName.trim() || isUpdating}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    {isUpdating ? 'Saving...' : 'Save'}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Household Members */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" /> Household Members
                        </h3>
                        {/* ... (rest of the member list) */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
