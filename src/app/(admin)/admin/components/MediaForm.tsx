"use client";

import React, { useCallback, useMemo, useReducer, useEffect } from "react";
import { throttle } from "lodash";

export interface Item {
  title: string;
  price: number | "";
  path: string;
  item_metadata: {
    resolution?: string;
    duration?: string;
    bitrate?: string;
    filesize?: number;
  };
  id?: number;
}

export interface TrackItem extends Item {}

export interface MediaFormData {
  id?: string | number;
  title: string;
  description?: string;
  genre: string[];
  cover_image?: string;
  trailer?: string;
  content_metadata: {
    [key: string]: string | number | boolean | undefined;
    director?: string;
    release_year?: number | "";
    duration_minutes?: number | "";
    is_series?: boolean;
    episodes?: number | "";
    studio?: string;
    artist?: string;
    is_album?: boolean;
    number_of_tracks?: number | "";
    author?: string;
    language?: string;
    pages?: number | "";
    version?: string;
    developer?: string;
    os_compatibility?: string;
    engine?: string;
    platform?: string;
  };
  items: Item[] | TrackItem[];
}

interface MediaFormProps {
  data: MediaFormData;
  onChange: (data: MediaFormData) => void;
  onSubmit: (data: MediaFormData, contentType: string) => void;
  mediaType: "movies" | "games" | "music" | "ebooks" | "softwares";
}

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "checkbox" | "url";
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

interface FormState {
  formData: MediaFormData;
  errors: Record<string, string>;
}

type FormAction =
  | { type: "UPDATE_FIELD"; name: string; value: string | string[] }
  | { type: "UPDATE_METADATA"; name: string; value: string | number | boolean }
  | {
      type: "UPDATE_ITEM";
      index: number;
      field: string;
      value: string | number;
      isItemMetadata?: boolean;
    }
  | { type: "ADD_ITEM" }
  | { type: "REMOVE_ITEM"; index: number }
  | { type: "SET_ERRORS"; errors: Record<string, string> }
  | { type: "SYNC_FORM_DATA"; formData: MediaFormData };

const NUMBER_FIELDS = [
  "release_year",
  "duration_minutes",
  "number_of_tracks",
  "pages",
  "episodes",
  "filesize",
];

const genrePlaceholderMap: Record<string, string> = {
  movies: "e.g. action, thriller, drama",
  music: "e.g. pop, jazz, hip-hop",
  games: "e.g. RPG, strategy, adventure",
  ebooks: "e.g. fiction, biography, history",
  softwares: "e.g. productivity, utility, development",
};

const initialItem: Item = {
  title: "",
  price: "",
  path: "",
  item_metadata: {},
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.name]: action.value,
        },
      };
    case "UPDATE_METADATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          content_metadata: {
            ...state.formData.content_metadata,
            [action.name]: action.value,
          },
        },
      };
    case "UPDATE_ITEM": {
      const updatedItems = [...state.formData.items];
      const currentItem = { ...updatedItems[action.index] } as Item;
      if (action.isItemMetadata) {
        currentItem.item_metadata = {
          ...currentItem.item_metadata,
          [action.field]: action.value || undefined,
        };
      } else {
        (currentItem as any)[action.field] =
          action.field === "price" && action.value === "" ? "" : action.value;
      }
      updatedItems[action.index] = currentItem;
      return {
        ...state,
        formData: {
          ...state.formData,
          items: updatedItems,
        },
      };
    }
    case "ADD_ITEM":
      return {
        ...state,
        formData: {
          ...state.formData,
          items: [...state.formData.items, { ...initialItem }],
        },
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        formData: {
          ...state.formData,
          items: state.formData.items.filter((_, i) => i !== action.index),
        },
      };
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.errors,
      };
    case "SYNC_FORM_DATA":
      return {
        ...state,
        formData: action.formData,
      };
    default:
      return state;
  }
}

interface ItemFormProps {
  item: Item;
  index: number;
  isEpisode: boolean;
  isTrack: boolean;
  onChange: (
    index: number,
    field: string,
    value: string | number,
    isItemMetadata?: boolean
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const ItemForm = React.memo(
  ({
    item,
    index,
    isEpisode,
    isTrack,
    onChange,
    onRemove,
    canRemove,
  }: ItemFormProps) => {
    return (
      <div className="border border-gray-700 p-4 rounded-lg space-y-4 bg-gray-800/30">
        {(isEpisode || isTrack) && (
          <div>
            <input
              type="text"
              placeholder={isEpisode ? "Episode Name" : "Track Title"}
              value={item.title || ""}
              onChange={(e) => onChange(index, "title", e.target.value)}
              className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
              aria-label={
                isEpisode
                  ? `Episode ${index + 1} Name`
                  : `Track ${index + 1} Title`
              }
            />
          </div>
        )}
        <div>
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="Price (USD)"
            value={item.price ?? ""}
            onChange={(e) =>
              onChange(
                index,
                "price",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
            aria-label={`${
              isEpisode ? `Episode` : isTrack ? `Track` : `Item`
            } ${index + 1} Price`}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="File path (URL or local path)"
            value={item.path || ""}
            onChange={(e) => onChange(index, "path", e.target.value)}
            className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
            aria-label={`${
              isEpisode ? `Episode` : isTrack ? `Track` : `Item`
            } ${index + 1} File Path`}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Resolution (optional)"
            value={item.item_metadata?.resolution || ""}
            onChange={(e) =>
              onChange(index, "resolution", e.target.value, true)
            }
            className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
            aria-label={`${
              isEpisode ? `Episode` : isTrack ? `Track` : `Item`
            } ${index + 1} Resolution`}
          />
        </div>
        <div>
          <input
            type="number"
            min={0}
            placeholder="File Size (MB, optional)"
            value={item.item_metadata?.filesize ?? ""}
            onChange={(e) =>
              onChange(
                index,
                "filesize",
                e.target.value === "" ? "" : Number(e.target.value),
                true
              )
            }
            className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
            aria-label={`${
              isEpisode ? `Episode` : isTrack ? `Track` : `Item`
            } ${index + 1} File Size`}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-400 text-sm transition-colors"
            aria-label={`Remove ${
              isEpisode
                ? `episode ${index + 1}`
                : isTrack
                ? `track ${index + 1}`
                : `item ${index + 1}`
            }`}
          >
            Remove
          </button>
        )}
      </div>
    );
  }
);

export default function MediaForm({
  data: initialData,
  onChange,
  onSubmit,
  mediaType,
}: MediaFormProps) {
  const [state, dispatch] = useReducer(formReducer, {
    formData: initialData,
    errors: {},
  });

  // Validate mediaType to prevent invalid rendering
  const validMediaTypes = ["movies", "games", "music", "ebooks", "softwares"];
  if (!validMediaTypes.includes(mediaType)) {
    console.error(`Invalid mediaType: ${mediaType}`);
    return <div className="text-red-500">Invalid media type: {mediaType}</div>;
  }

  const validateField = useCallback((name: string, value: any): string => {
    if (name === "title" && !value) return "Title is required";
    if (name === "genre" && (!value || (Array.isArray(value) && !value.length)))
      return "At least one genre is required";
    if (name === "cover_image" && value && !isValidUrl(value))
      return "Invalid URL";
    if (name === "trailer" && value && !isValidUrl(value)) return "Invalid URL";
    if (NUMBER_FIELDS.includes(name) && value && (isNaN(value) || value < 0))
      return `${name.replace("_", " ")} must be a positive number`;
    return "";
  }, []);

  const isValidUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const isEpisode =
    mediaType === "movies" && state.formData.content_metadata.is_series;
  const isTrack =
    mediaType === "music" && state.formData.content_metadata.is_album;

  // Throttle parent updates
  const throttledOnChange = useMemo(() => {
    return throttle((updatedData: MediaFormData) => {
      onChange(updatedData);
    }, 500);
  }, [onChange]);

  // Sync local state with parent on change
  useEffect(() => {
    console.log("MediaForm: state.formData =", state.formData);
    throttledOnChange(state.formData);
    return () => throttledOnChange.cancel();
  }, [state.formData, throttledOnChange]);

  // Sync initialData changes from parent
  useEffect(() => {
    console.log("MediaForm: initialData =", initialData);
    dispatch({ type: "SYNC_FORM_DATA", formData: initialData });
  }, [initialData]);

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const error = validateField(name, value);
      dispatch({
        type: "SET_ERRORS",
        errors: { ...state.errors, [name]: error },
      });

      if (name === "genre") {
        dispatch({
          type: "UPDATE_FIELD",
          name,
          value: value
            .split(",")
            .map((g) => g.trim())
            .filter(Boolean),
        });
      } else {
        dispatch({
          type: "UPDATE_FIELD",
          name,
          value,
        });
      }
    },
    [state.errors, validateField]
  );

  const handleContentMetadataChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, type, checked, value } = e.target;
      const error = validateField(name, value);
      dispatch({
        type: "SET_ERRORS",
        errors: { ...state.errors, [name]: error },
      });

      dispatch({
        type: "UPDATE_METADATA",
        name,
        value:
          type === "checkbox"
            ? checked
            : NUMBER_FIELDS.includes(name)
            ? value === ""
              ? ""
              : Number(value)
            : value || "",
      });
    },
    [state.errors, validateField]
  );

  const handleItemChange = useCallback(
    (
      index: number,
      field: string,
      value: string | number,
      isItemMetadata = false
    ) => {
      dispatch({
        type: "UPDATE_ITEM",
        index,
        field,
        value,
        isItemMetadata,
      });
    },
    []
  );

  const addItem = useCallback(() => {
    dispatch({ type: "ADD_ITEM" });
  }, []);

  const removeItem = useCallback(
    (index: number) => {
      if (
        window.confirm(
          `Are you sure you want to remove this ${
            isEpisode ? "episode" : isTrack ? "track" : "item"
          }?`
        )
      ) {
        dispatch({ type: "REMOVE_ITEM", index });
      }
    },
    [isEpisode, isTrack]
  );

  const metadataFields: FieldConfig[] = useMemo(() => {
    switch (mediaType) {
      case "movies":
        return [
          {
            name: "director",
            label: "Director",
            type: "text",
            placeholder: "Director name",
            required: true,
          },
          {
            name: "release_year",
            label: "Release Year",
            type: "number",
            placeholder: "2010",
            min: 1800,
            max: new Date().getFullYear() + 5,
            required: true,
          },
          {
            name: "duration_minutes",
            label: "Duration (minutes)",
            type: "number",
            placeholder: "148",
            min: 1,
            required: true,
          },
          { name: "is_series", label: "Is Series?", type: "checkbox" },
          ...(state.formData.content_metadata.is_series
            ? [
                {
                  name: "episodes",
                  label: "Episodes",
                  type: "number",
                  placeholder: "e.g. 10",
                  min: 1,
                },
              ]
            : []),
        ];
      case "games":
        return [
          {
            name: "studio",
            label: "Studio",
            type: "text",
            placeholder: "Game studio",
            required: true,
          },
          {
            name: "engine",
            label: "Game Engine",
            type: "text",
            placeholder: "Unreal, Unity...",
          },
          {
            name: "platform",
            label: "Platform",
            type: "text",
            placeholder: "PC, PS5...",
          },
        ];
      case "music":
        return [
          {
            name: "artist",
            label: "Artist",
            type: "text",
            placeholder: "Artist name",
            required: true,
          },
          { name: "is_album", label: "Is Album?", type: "checkbox" },
          ...(state.formData.content_metadata.is_album
            ? [
                {
                  name: "number_of_tracks",
                  label: "Number of Tracks",
                  type: "number",
                  placeholder: "e.g. 12",
                  min: 1,
                },
              ]
            : []),
        ];
      case "ebooks":
        return [
          {
            name: "author",
            label: "Author",
            type: "text",
            placeholder: "Author name",
            required: true,
          },
          {
            name: "language",
            label: "Language",
            type: "text",
            placeholder: "English, Amharic...",
          },
          {
            name: "pages",
            label: "Pages",
            type: "number",
            placeholder: "e.g. 220",
            min: 1,
          },
        ];
      case "softwares":
        return [
          {
            name: "version",
            label: "Version",
            type: "text",
            placeholder: "e.g. 1.0.0",
            required: true,
          },
          {
            name: "developer",
            label: "Developer",
            type: "text",
            placeholder: "e.g. Adobe",
            required: true,
          },
          {
            name: "os_compatibility",
            label: "OS Compatibility",
            type: "text",
            placeholder: "e.g. Windows, macOS, Linux",
          },
        ];
      default:
        return [];
    }
  }, [
    mediaType,
    state.formData.content_metadata.is_series,
    state.formData.content_metadata.is_album,
  ]);

  return (
    <form
      id={`${mediaType}-form`}
      className="space-y-6 p-6 bg-gray-900/20 rounded-lg"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(state.formData, mediaType.slice(0, -1));
      }}
      aria-label={`${mediaType} form`}
    >
      {/* Basic Fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-cinema-purple font-cinematic mb-1"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={state.formData.title || ""}
            onChange={handleFieldChange}
            required
            placeholder={`Enter ${mediaType.slice(0, -1)} title`}
            className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            aria-invalid={!!state.errors.title}
            aria-describedby={state.errors.title ? "title-error" : undefined}
          />
          {state.errors.title && (
            <p id="title-error" className="text-red-500 text-sm mt-1">
              {state.errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-cinema-purple font-cinematic mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={state.formData.description || ""}
            onChange={handleFieldChange}
            placeholder={`Enter brief ${mediaType.slice(0, -1)} description`}
            rows={3}
            className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500"
            aria-describedby={
              state.errors.description ? "description-error" : undefined
            }
          />
          {state.errors.description && (
            <p id="description-error" className="text-red-500 text-sm mt-1">
              {state.errors.description}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="genre"
            className="block text-cinema-purple font-cinematic mb-1"
          >
            Genre (comma separated)
          </label>
          <input
            id="genre"
            name="genre"
            type="text"
            value={state.formData.genre.join(", ") || ""}
            onChange={handleFieldChange}
            required
            placeholder={
              genrePlaceholderMap[mediaType] || "e.g. genre1, genre2"
            }
            className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            aria-invalid={!!state.errors.genre}
            aria-describedby={state.errors.genre ? "genre-error" : undefined}
          />
          {state.errors.genre && (
            <p id="genre-error" className="text-red-500 text-sm mt-1">
              {state.errors.genre}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cover_image"
            className="block text-cinema-purple font-cinematic mb-1"
          >
            Cover Image URL
          </label>
          <input
            id="cover_image"
            name="cover_image"
            type="url"
            value={state.formData.cover_image || ""}
            onChange={handleFieldChange}
            placeholder="https://example.com/cover.jpg"
            className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
            aria-invalid={!!state.errors.cover_image}
            aria-describedby={
              state.errors.cover_image ? "cover_image-error" : undefined
            }
          />
          {state.errors.cover_image && (
            <p id="cover_image-error" className="text-red-500 text-sm mt-1">
              {state.errors.cover_image}
            </p>
          )}
          {state.formData.cover_image && (
            <img
              src={state.formData.cover_image}
              alt="Preview"
              onError={(e) => (e.currentTarget.src = "/fallback-image.png")}
              className="mt-2 w-32 rounded shadow border border-gray-700"
            />
          )}
        </div>

        {mediaType === "movies" && (
          <div>
            <label
              htmlFor="trailer"
              className="block text-cinema-purple font-cinematic mb-1"
            >
              Trailer URL
            </label>
            <input
              id="trailer"
              name="trailer"
              type="url"
              value={state.formData.trailer || ""}
              onChange={handleFieldChange}
              placeholder="https://youtube.com/..."
              className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              aria-invalid={!!state.errors.trailer}
              aria-describedby={
                state.errors.trailer ? "trailer-error" : undefined
              }
            />
            {state.errors.trailer && (
              <p id="trailer-error" className="text-red-500 text-sm mt-1">
                {state.errors.trailer}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      <fieldset className="border border-white/30 rounded-lg p-4 space-y-4">
        <legend className="text-cinema-purple font-cinematic font-semibold px-2">
          Content Metadata
        </legend>
        {metadataFields.map((field) => (
          <div key={field.name} className="flex items-center gap-4">
            <label
              htmlFor={field.name}
              className="text-cinema-purple font-cinematic w-40"
            >
              {field.label}
            </label>
            {field.type === "checkbox" ? (
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                checked={Boolean(state.formData.content_metadata[field.name])}
                onChange={handleContentMetadataChange}
                className="h-5 w-5 accent-purple-500 focus:ring-2 focus:ring-purple-500"
                aria-checked={Boolean(
                  state.formData.content_metadata[field.name]
                )}
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={
                  typeof state.formData.content_metadata[field.name] ===
                  "boolean"
                    ? ""
                    : (state.formData.content_metadata[field.name] as
                        | string
                        | number
                        | undefined) ?? ""
                }
                onChange={handleContentMetadataChange}
                required={field.required}
                placeholder={field.placeholder}
                min={NUMBER_FIELDS.includes(field.name) ? field.min : undefined}
                max={NUMBER_FIELDS.includes(field.name) ? field.max : undefined}
                className="w-full p-3 bg-gray-800/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                aria-invalid={!!state.errors[field.name]}
                aria-describedby={
                  state.errors[field.name] ? `${field.name}-error` : undefined
                }
              />
            )}
            {state.errors[field.name] && (
              <p
                id={`${field.name}-error`}
                className="text-red-500 text-sm mt-1"
              >
                {state.errors[field.name]}
              </p>
            )}
          </div>
        ))}
      </fieldset>

      {/* Items or Tracks */}
      <fieldset className="border border-white/30 rounded-lg p-4 space-y-6">
        <legend className="text-cinema-purple font-cinematic font-semibold px-2">
          {isTrack ? "Album Tracks" : isEpisode ? "Episodes" : "Items"}
        </legend>
        {state.formData.items.length === 0 && (
          <p className="text-gray-400">
            No {isEpisode ? "episodes" : isTrack ? "tracks" : "items"} added
            yet.
          </p>
        )}
        {state.formData.items.map((item, index) => (
          <ItemForm
            key={index}
            item={item}
            index={index}
            isEpisode={isEpisode}
            isTrack={isTrack}
            onChange={handleItemChange}
            onRemove={removeItem}
            canRemove={state.formData.items.length > 1}
          />
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          aria-label={`Add new ${
            isEpisode ? "episode" : isTrack ? "track" : "item"
          }`}
        >
          + Add another {isEpisode ? "episode" : isTrack ? "track" : "item"}
        </button>
      </fieldset>
    </form>
  );
}
