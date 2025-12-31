import dayjs from "dayjs";
import { message } from "@/utils/message";
import { reactive, ref, onMounted, toRaw } from "vue";
import type { PaginationProps } from "@pureadmin/table";
import {
  getSystemConfigApi,
  getSystemConfigListApi,
  type ConfigModel
} from "@/api/system/config";
import { getRouteTreeApi } from "@/api/system/route";

export function useSystemConfig() {
  // 系统设置表单数据（使用后端字段名）
  const systemConfigForm = reactive({
    SYSTEM_LOGO: "",
    SYSTEM_NAME: "",
    SYSTEM_TITLE: "",
    SYSTEM_DESCRIPTION: "",
    SITE_COPYRIGHT: "",
    LOGIN_CAPTCHA_SWITCH: "false",
    MAX_DEPT_LEVEL: 0,
    DEFAULT_MENU: [] as (string | number)[],
    ACCOUNT_LOCK_COUNT: 0,
    ACCOUNT_LOCK_TIME: 0,
    USER_DEFAULT_PASSWORD: ""
  });

  // 菜单树数据
  const menuTreeData = ref([]);

  const formRef = ref();
  const loading = ref(false);
  const systemConfigLoading = ref(false);

  // 配置列表相关
  const configListForm = reactive({
    configKey: ""
  });

  const configListFormRef = ref();
  const configDataList = ref<ConfigModel[]>([]);
  const configListLoading = ref(true);

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90,
      index: (index: number) =>
        (pagination.currentPage - 1) * pagination.pageSize + index + 1
    },
    {
      label: "配置名称",
      prop: "configName",
      minWidth: 150
    },
    {
      label: "配置key",
      prop: "configKey",
      minWidth: 180
    },
    {
      label: "配置value",
      prop: "configValue",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    }
  ];

  // 获取菜单树
  async function getMenuTree() {
    try {
      const { result } = await getRouteTreeApi();
      menuTreeData.value = result || [];
    } catch (error) {
      console.error("获取菜单树失败:", error);
    }
  }

  // 获取系统配置
  async function getSystemConfig() {
    systemConfigLoading.value = true;
    try {
      const { result } = await getSystemConfigApi();
      if (result) {
        // 处理验证码开关：如果是布尔值，转换为字符串
        if (typeof result.LOGIN_CAPTCHA_SWITCH === "boolean") {
          result.LOGIN_CAPTCHA_SWITCH = result.LOGIN_CAPTCHA_SWITCH
            ? "true"
            : "false";
        }
        // 处理默认菜单：如果是字符串，尝试解析为数组
        if (typeof result.DEFAULT_MENU === "string") {
          try {
            result.DEFAULT_MENU = result.DEFAULT_MENU
              ? JSON.parse(result.DEFAULT_MENU)
              : [];
          } catch {
            result.DEFAULT_MENU = result.DEFAULT_MENU
              ? [result.DEFAULT_MENU]
              : [];
          }
        }
        Object.assign(systemConfigForm, result);
      }
    } catch (error) {
      console.error("获取系统配置失败:", error);
    } finally {
      systemConfigLoading.value = false;
    }
  }

  // 保存系统配置
  async function saveSystemConfig() {
    if (!formRef.value) return;

    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true;
        try {
          // 准备提交数据
          const submitData = { ...toRaw(systemConfigForm) };
          // 处理默认菜单：如果是数组，转换为JSON字符串
          if (Array.isArray(submitData.DEFAULT_MENU)) {
            submitData.DEFAULT_MENU = JSON.stringify(submitData.DEFAULT_MENU);
          }
          // TODO: 这里需要添加保存系统配置的API
          // await saveSystemConfigApi(submitData);
          message("保存成功", { type: "success" });
        } catch (error) {
          console.error("保存系统配置失败:", error);
          message("保存失败", { type: "error" });
        } finally {
          loading.value = false;
        }
      }
    });
  }

  // 获取配置列表
  async function getConfigList() {
    configListLoading.value = true;
    try {
      const queryParams = {
        ...toRaw(configListForm),
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize
      };
      const { result } = await getSystemConfigListApi(queryParams);
      configDataList.value = result.items || [];
      pagination.total = result.total || 0;
      pagination.pageSize = result.pageSize || 10;
      pagination.currentPage = result.pageNum || 1;
    } catch (error) {
      console.error("获取配置列表失败:", error);
    } finally {
      configListLoading.value = false;
    }
  }

  // 搜索配置列表
  function onSearch() {
    pagination.currentPage = 1;
    getConfigList();
  }

  // 重置搜索表单
  function resetConfigListForm() {
    if (!configListFormRef.value) return;
    configListFormRef.value.resetFields();
    onSearch();
  }

  // 分页大小改变
  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    getConfigList();
  }

  // 当前页改变
  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    getConfigList();
  }

  // 移除 onMounted 中的自动调用，改为在标签页切换时调用
  // onMounted(() => {
  //   getSystemConfig();
  //   getConfigList();
  // });

  // 初始化时加载菜单树
  onMounted(() => {
    getMenuTree();
  });

  return {
    systemConfigForm,
    formRef,
    loading,
    systemConfigLoading,
    saveSystemConfig,
    getSystemConfig,
    getConfigList,
    menuTreeData,
    configListForm,
    configListFormRef,
    configDataList,
    configListLoading,
    columns,
    pagination,
    onSearch,
    resetConfigListForm,
    handleSizeChange,
    handleCurrentChange
  };
}
