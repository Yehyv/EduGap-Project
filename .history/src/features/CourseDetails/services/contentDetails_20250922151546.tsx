import api from "@/shared/services/axios";
import type {
  ApiResponse,
  ContentDetailsType,
} from "@/shared/types/sharedTypes";

export async function getContentDetails(): Promise<ContentDetailsType> {
  const res = await api.get<ApiResponse<ContentDetailsType>>(
    "/contents/1/content-details/unenrolled"
  );
  return res.data.data;
}
