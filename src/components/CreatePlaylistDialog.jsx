import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { playlistService } from '../api/services'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus } from 'lucide-react'

const CreatePlaylistDialog = ({ onPlaylistCreated, children }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            isPublic: true
        }
    })

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            const response = await playlistService.createPlaylist(data)
            if (response?.data?.data) {
                onPlaylistCreated?.(response.data.data)
                form.reset()
                setOpen(false)
            }
        } catch (error) {
            console.error('Error creating playlist:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Create Playlist</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                    <DialogDescription>
                        Create a new playlist to organize your videos.
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
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Playlist'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePlaylistDialog