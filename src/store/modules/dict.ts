import { defineStore } from "pinia";
import { store } from "../utils";
import { getDictDataListApi, type DictDataModel } from "@/api/system/dict";

/**
 * 字典数据存储结构
 * key: dictKey (字典Key)
 * value: DictDataModel[] (该字典Key对应的所有字典数据)
 */
interface DictState {
  dictMap: Record<string, DictDataModel[]>;
  loadingMap: Record<string, boolean>;
}

export const useDictStore = defineStore("pure-dict", {
  state: (): DictState => ({
    dictMap: {},
    loadingMap: {}
  }),

  getters: {
    /**
     * 根据字典Key获取字典数据列表
     * @param state
     * @returns 返回一个函数，接收 dictKey 参数，返回对应的字典数据数组
     */
    getDictDataByKey: state => {
      return (dictKey: string): DictDataModel[] => {
        return state.dictMap[dictKey] || [];
      };
    },

    /**
     * 根据字典Key和字典值获取字典标签
     * @param state
     * @returns 返回一个函数，接收 dictKey 和 dictValue 参数，返回对应的标签
     */
    getDictLabel: state => {
      return (dictKey: string, dictValue: string | number): string => {
        const dictList = state.dictMap[dictKey] || [];
        const dictItem = dictList.find(
          item => String(item.dictValue) === String(dictValue)
        );
        return dictItem?.dictLabel || String(dictValue);
      };
    },

    /**
     * 根据字典Key获取字典选项（用于下拉选择）
     * @param state
     * @returns 返回一个函数，接收 dictKey 参数，返回格式化的选项数组
     */
    getDictOptions: state => {
      return (
        dictKey: string
      ): Array<{ label: string; value: string | number }> => {
        const dictList = state.dictMap[dictKey] || [];
        return dictList
          .filter(item => item.status === "0") // 只返回正常状态的字典
          .sort((a, b) => a.dictSort - b.dictSort) // 按排序字段排序
          .map(item => ({
            label: item.dictLabel,
            value: item.dictValue
          }));
      };
    },

    /**
     * 检查字典Key是否正在加载
     * @param state
     * @returns 返回一个函数，接收 dictKey 参数，返回是否正在加载
     */
    isLoading: state => {
      return (dictKey: string): boolean => {
        return state.loadingMap[dictKey] || false;
      };
    }
  },

  actions: {
    /**
     * 获取字典数据并存储
     * @param dictKey 字典Key
     * @param forceRefresh 是否强制刷新（默认false，如果已存在则不重新获取）
     */
    async fetchDictData(dictKey: string, forceRefresh = false) {
      // 如果已存在且不强制刷新，则直接返回
      if (!forceRefresh && this.dictMap[dictKey]) {
        return this.dictMap[dictKey];
      }

      // 如果正在加载，则等待
      if (this.loadingMap[dictKey]) {
        return this.dictMap[dictKey] || [];
      }

      try {
        this.loadingMap[dictKey] = true;
        const response = await getDictDataListApi({
          dictKey,
          status: "0", // 只获取正常状态的字典
          pageNum: 1,
          pageSize: 1000 // 获取所有数据
        });

        if (response?.result?.items) {
          this.dictMap[dictKey] = response.result.items;
          return response.result.items;
        }
        return [];
      } catch (error) {
        console.error(`获取字典数据失败 [dictKey: ${dictKey}]:`, error);
        return [];
      } finally {
        this.loadingMap[dictKey] = false;
      }
    },

    /**
     * 批量获取字典数据
     * @param dictKeys 字典Key数组
     * @param forceRefresh 是否强制刷新
     */
    async fetchDictDataBatch(dictKeys: string[], forceRefresh = false) {
      const promises = dictKeys.map(key =>
        this.fetchDictData(key, forceRefresh)
      );
      await Promise.all(promises);
    },

    /**
     * 清除指定字典Key的缓存
     * @param dictKey 字典Key，如果不传则清除所有缓存
     */
    clearDictCache(dictKey?: string) {
      if (dictKey) {
        delete this.dictMap[dictKey];
        delete this.loadingMap[dictKey];
      } else {
        this.dictMap = {};
        this.loadingMap = {};
      }
    },

    /**
     * 设置字典数据（用于手动设置或更新）
     * @param dictKey 字典Key
     * @param dictData 字典数据数组
     */
    setDictData(dictKey: string, dictData: DictDataModel[]) {
      this.dictMap[dictKey] = dictData;
    }
  }
});

export function useDictStoreHook() {
  return useDictStore(store);
}
