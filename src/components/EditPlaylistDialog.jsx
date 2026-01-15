import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { playlistService } from '../api/services'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from './ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { toast } from 'sonner'

const EditPlaylistDialog = ({ open, onOpenChange, playlist, onPlaylistUpdated }) => {
    const [loading, setLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            name: playlist?.name || '',
            description: playlist?.description || '',
            isPublic: playlist?.isPublic ?? true
        }
    })

    useEffect(() => {
        if (playlist) {
            form.reset({
                name: playlist.name || '',
                description: playlist.description || '',
                isPublic: playlist.isPublic ?? true
            })
        }
    }, [playlist, form])

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            const response = await playlistService.updatePlaylist(playlist.id, data)
            if (response?.data?.data) {
                onPlaylistUpdated?.(response.data.data)
                onOpenChange(false)
                toast.success('Playlist updated successfully')
            }
        } catch (error) {
            toast.error('Failed to update playlist')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Playlist</DialogTitle>
                    <DialogDescription>
                        Update your playlist details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            rules={{
                                required: 'Playlist name is required',
                                minLength: {
                                    value: 1,
                                    message: 'Playlist name must be at least 1 character'
                                },
                                maxLength: {
                                    value: 100,
                                    message: 'Playlist name must be less than 100 characters'
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter playlist name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            rules={{
                                maxLength: {
                                    value: 500,
                                    message: 'Description must be less than 500 characters'
                                }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your playlist (optional)"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {field.value?.length || 0}/500 characters
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Public Playlist</FormLabel>
                                        <FormDescription>
                                            Make this playlist visible to everyone
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default EditPlaylistDialog
