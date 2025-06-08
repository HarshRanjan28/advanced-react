import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { Experience, User } from "@advanced-react/server/database/schema";
import { useParams, useSearch } from "@tanstack/react-router";

type ExperienceMutationOptions = {
  add?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  edit?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  delete?: {
    onSuccess?: (id: Experience["id"]) => void;
  };
  kick?: {
    onSuccess: () => void;
  };
};

export function useExperienceMutation(options: ExperienceMutationOptions = {}) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { userId: pathUserId } = useParams({ strict: false });
  const { tagId: pathTagId } = useParams({ strict: false });
  const { q: pathQ } = useSearch({ strict: false });
  const { tags: pathTags } = useSearch({ strict: false });
  const { currentUser } = useCurrentUser();

  const addMutation = trpc.experiences.add.useMutation({
    onSuccess: async ({ id }) => {
      toast({
        title: "Experience Created",
        description: "Your Experience has been created",
      });
      options.add?.onSuccess?.(id);
    },
  });

  const editMutation = trpc.experiences.edit.useMutation({
    onSuccess: async ({ id }) => {
      await utils.experiences.byId.invalidate({ id });

      toast({
        title: "Experience updated",
        description: "Your experience has been updated",
        variant: "success",
      });
      options.edit?.onSuccess?.(id);
    },
    onError: (error) => {
      toast({
        title: "Failed to edit Experiences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.experiences.delete.useMutation({
    onSuccess: async (id) => {
      await Promise.all([
        utils.experiences.feed.invalidate(),
        ...(pathUserId
          ? [utils.experiences.byUserId.invalidate({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags
          ? [utils.experiences.search.invalidate({ q: pathQ, tags: pathTags })]
          : []),
        utils.experiences.favorites.cancel(),
        ...(pathTagId
          ? [utils.experiences.byTagId.invalidate({ id: pathTagId })]
          : []),
      ]);
      options.delete?.onSuccess?.(id);
    },

    onError: (error) => {
      toast({
        title: "Failed to delete Experiences",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const attendMutation = trpc.experiences.attend.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendeesCount: number;
          attendees?: User[];
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: true,
          attendeesCount: oldData.attendeesCount + 1,
          ...(oldData.attendees && {
            attendees: [currentUser, ...oldData.attendees],
          }),
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel(),
        ...(pathUserId
          ? [utils.experiences.byUserId.cancel({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags
          ? [utils.experiences.search.cancel({ q: pathQ, tags: pathTags })]
          : []),
        utils.experiences.favorites.cancel(),
        ...(pathTagId ? [utils.experiences.byTagId.cancel()] : []),
      ]);

      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
              })
            : undefined,
        favorites: utils.experiences.favorites.getInfiniteData({}),
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData({ id: pathTagId })
          : undefined,
      };

      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          (oldData) => {
            if (!oldData) {
              return;
            }
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }
      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          context?.previousData.search,
        );
      }
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );

      toast({
        title: "Failed to update experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unattendMutation = trpc.experiences.unattend.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends {
          isAttending: boolean;
          attendees?: User[];
          attendeesCount: number;
        },
      >(oldData: T) {
        return {
          ...oldData,
          isAttending: false,
          attendeesCount: Math.max(0, oldData.attendeesCount - 1),
          ...(oldData.attendees && {
            attendees: oldData.attendees.filter(
              (attendee) => attendee.id !== currentUser?.id,
            ),
          }),
        };
      }
      await Promise.all([
        utils.experiences.byId.cancel({ id }),
        utils.experiences.feed.cancel(),
        ...(pathUserId
          ? [utils.experiences.byUserId.cancel({ id: pathUserId })]
          : []),
        ...(pathQ || pathTags
          ? [utils.experiences.search.cancel({ q: pathQ, tags: pathTags })]
          : []),
        ...(pathTagId
          ? [utils.experiences.byTagId.cancel({ id: pathTagId })]
          : []),
        utils.experiences.favorites.cancel(),
      ]);

      const previousData = {
        byId: utils.experiences.byId.getData({ id }),
        feed: utils.experiences.feed.getInfiniteData(),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        search:
          pathQ || pathTags
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
              })
            : undefined,
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData({ id: pathTagId })
          : undefined,
        favorites: utils.experiences.favorites.getInfiniteData({}),
      };

      // updating the cache for experience detail page
      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }
        return updateExperience(oldData);
      });

      // updating the cache for the feed
      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      // updating the cache for the experience in the user profile page
      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) {
              return;
            }
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      // updating the cache for the experience if the path in tag/tagId
      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      // updating the cache for the experience if the path is search q
      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          (oldData) => {
            if (!oldData) {
              return;
            }
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (error, { id }, context) => {
      utils.experiences.byId.setData({ id }, context?.previousData.byId);
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          context?.previousData.search,
        );
      }
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      );

      toast({
        title: "Failed to update experience",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = trpc.experiences.favorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: true,
          favoritesCount: oldData.favoritesCount + 1,
        };
      }
      await Promise.all([
        utils.experiences.feed.cancel(),
        utils.experiences.byId.cancel({ id }),
        pathUserId
          ? utils.experiences.byUserId.cancel({ id: pathUserId })
          : undefined,
        pathQ || pathTags
          ? utils.experiences.search.cancel({ q: pathQ, tags: pathTags })
          : undefined,
        pathTagId
          ? utils.experiences.byTagId.cancel({ id: pathTagId })
          : undefined,
      ]);

      const previousData = {
        feed: utils.experiences.feed.getInfiniteData({}),
        byExperienceid: utils.experiences.byId.getData({ id }),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData({ id: pathTagId })
          : undefined,
        search:
          pathQ || pathTags
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
              })
            : undefined,
      };

      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;

        return updateExperience(oldData);
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      return { previousData };
    },

    onError: (error, { id }, context) => {
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      utils.experiences.byId.setData(
        { id },
        context?.previousData.byExperienceid,
      );

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          context?.previousData.search,
        );
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfavoriteMutation = trpc.experiences.unfavorite.useMutation({
    onMutate: async ({ id }) => {
      function updateExperience<
        T extends { isFavorited: boolean; favoritesCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFavorited: false,
          favoritesCount: Math.max(oldData.favoritesCount - 1, 0),
        };
      }
      await Promise.all([
        utils.experiences.favorites.cancel(),
        utils.experiences.feed.cancel(),
        utils.experiences.byId.cancel({ id }),
        pathUserId
          ? utils.experiences.byUserId.cancel({ id: pathUserId })
          : undefined,
        pathQ || pathTags
          ? utils.experiences.search.cancel({ q: pathQ, tags: pathTags })
          : undefined,
        pathTagId
          ? utils.experiences.byTagId.cancel({ id: pathTagId })
          : undefined,
      ]);

      const previousData = {
        feed: utils.experiences.feed.getInfiniteData({}),
        favorites: utils.experiences.favorites.getInfiniteData({}),
        byExperienceid: utils.experiences.byId.getData({ id }),
        byUserId: pathUserId
          ? utils.experiences.byUserId.getInfiniteData({ id: pathUserId })
          : undefined,
        byTagId: pathTagId
          ? utils.experiences.byTagId.getInfiniteData({ id: pathTagId })
          : undefined,
        search:
          pathQ || pathTags
            ? utils.experiences.search.getInfiniteData({
                q: pathQ,
                tags: pathTags,
              })
            : undefined,
      };

      utils.experiences.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.map((e) =>
              e.id === id ? updateExperience(e) : e,
            ),
          })),
        };
      });

      utils.experiences.favorites.setInfiniteData({}, (oldData) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            experiences: page.experiences.filter((e) => e.id !== id),
          })),
        };
      });

      utils.experiences.byId.setData({ id }, (oldData) => {
        if (!oldData) return;

        return updateExperience(oldData);
      });

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          (oldData) => {
            if (!oldData) return;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                experiences: page.experiences.map((e) =>
                  e.id === id ? updateExperience(e) : e,
                ),
              })),
            };
          },
        );
      }

      return { previousData };
    },

    onError: (error, { id }, context) => {
      utils.experiences.feed.setInfiniteData({}, context?.previousData.feed);
      utils.experiences.favorites.setInfiniteData(
        {},
        context?.previousData.favorites,
      ),
        utils.experiences.byId.setData(
          { id },
          context?.previousData.byExperienceid,
        );

      if (pathUserId) {
        utils.experiences.byUserId.setInfiniteData(
          { id: pathUserId },
          context?.previousData.byUserId,
        );
      }

      if (pathTagId) {
        utils.experiences.byTagId.setInfiniteData(
          { id: pathTagId },
          context?.previousData.byTagId,
        );
      }

      if (pathQ || pathTags) {
        utils.experiences.search.setInfiniteData(
          { q: pathQ, tags: pathTags },
          context?.previousData.search,
        );
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const kickMutation = trpc.experiences.kickAttendee.useMutation({
    onMutate: async ({ experienceId, userId }) => {
      await utils.users.experienceAttendees.cancel({ experienceId });

      const previousData = {
        experienceAttendees: utils.users.experienceAttendees.getInfiniteData({
          experienceId,
        }),
      };
      utils.users.experienceAttendees.setInfiniteData(
        { experienceId },
        (oldData) => {
          if (!oldData) return;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              attendees: page.attendees.filter(
                (attendee) => attendee.id !== userId,
              ),
              attendeesCount: Math.max(0, page.attendeesCount - 1),
            })),
          };
        },
      );

      return { previousData };
    },

    onSuccess: () => {
      options.kick?.onSuccess();
    },

    onError: (error, { experienceId }, context) => {
      utils.users.experienceAttendees.setInfiniteData(
        { experienceId },
        context?.previousData.experienceAttendees,
      );
      toast({
        title: "Error Updating Attendees",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addMutation,
    editMutation,
    deleteMutation,
    attendMutation,
    unattendMutation,
    favoriteMutation,
    unfavoriteMutation,
    kickMutation,
  };
}
